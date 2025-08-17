import { useCallback, useEffect, useState, type JSX } from "react";
import { match } from "ts-pattern";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { AlertCircleIcon, ChevronDown, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/utils/db";

interface DataTablePropsPending {
  status: "pending";
}

interface DataTablePropsError {
  status: "error";
  error: Error;
}

interface DataTablePropsSuccess<TData> {
  status: "success";
  data: TData[];
}

type DataTableProps<TData, TValue> = (
  | DataTablePropsPending
  | DataTablePropsError
  | DataTablePropsSuccess<TData>
) & {
  columns: ColumnDef<TData, TValue>[];
  query?: string;
  setQuery?: (query: string) => void;
};

const schema = z.object({
  query: z.string().refine(
    async (val) => {
      const conn = await db.connect();

      try {
        await conn.prepare(val);
        return true;
      } catch {
        return false;
      } finally {
        await conn.close();
      }
    },
    {
      message: "Invalid SQL query",
    }
  ),
});

export default function DataTable<TData, TValue>(
  props: DataTableProps<TData, TValue>
): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: props.status === "success" ? props.data : [],
    columns: props.columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      query: props.query,
    },
  });

  const { reset } = form;

  const onSubmit = useCallback(
    (data: z.infer<typeof schema>) => {
      props.setQuery?.(data.query);
    },
    [props]
  );

  useEffect(() => {
    reset({ query: props.query });
  }, [reset, props.query]);

  return (
    <div className="container mx-auto flex flex-col justify-center items-center gap-3">
      <div className="w-full">
        <div className="flex items-center py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-row gap-3 items-center"
            >
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">SQL Query</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Filter columns..."
                        className="w-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a valid SQL query to filter the data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                Query
              </Button>
            </form>
          </Form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {match(props)
          .with({ status: "pending" }, () => (
            <div className="flex items-center justify-center h-64">
              <LoaderCircle className="animate-spin" />
            </div>
          ))
          .with({ status: "error" }, ({ error }) => (
            <Alert
              variant="destructive"
              className="w-full max-w-md border-destructive"
            >
              <AlertCircleIcon />
              <AlertTitle>An error occurred while fetching the data</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ))
          .with({ status: "success" }, ({ columns }) => (
            <>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-64 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ))
          .exhaustive()}
      </div>
    </div>
  );
}
