import { useMemo, useState, type JSX } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/features/table/data-table";
import DataTableColumnHeader from "@/components/features/table/data-table-column-header";
import selectableColumn from "@/components/features/table/columns";
import useTableRecords from "@/hooks/useTableRecords";
import type { AppNodeData } from "@/types/flow";

interface PreviewProps {
  data: AppNodeData;
}

export default function Preview({ data }: PreviewProps): JSX.Element {
  const [selectQuery, setSelectQuery] = useState<string>(
    () => `SELECT * FROM "${data.label}"`
  );

  const fetchStatus = useTableRecords(selectQuery);

  const dynamicColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      fetchStatus.status === "success" && fetchStatus.data.length > 0
        ? Object.keys(fetchStatus.data[0])
            .map(
              (key) =>
                ({
                  id: key,
                  accessorKey: key,
                  header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={key} />
                  ),
                } satisfies ColumnDef<Record<string, unknown>>)
            )
            .filter((column) => column.id !== "")
        : [],
    [fetchStatus.status, fetchStatus.data]
  );

  if (fetchStatus.status === "pending")
    return (
      <DataTable
        status="pending"
        columns={[selectableColumn, ...dynamicColumns]}
        query={selectQuery}
        setQuery={setSelectQuery}
      />
    );

  if (fetchStatus.status === "error")
    return (
      <DataTable
        status="error"
        error={fetchStatus.error}
        columns={[selectableColumn, ...dynamicColumns]}
        query={selectQuery}
        setQuery={setSelectQuery}
      />
    );

  return (
    <DataTable
      status="success"
      columns={[selectableColumn, ...dynamicColumns]}
      data={fetchStatus.data}
      query={selectQuery}
      setQuery={setSelectQuery}
    />
  );
}
