import { useEffect, useMemo, type JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import alasql from "alasql";
import { type ColumnDef } from "@tanstack/react-table";
import { AlertCircleIcon, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DataTable from "@/components/features/data-table";
import DataTableColumnHeader from "@/components/features/data-table-column-header";
import selectableColumn from "@/components/features/columns";
import { MIME_TYPES } from "@/const/mime-types";

interface PreviewProps {
  file: File;
}

function Preview({ file }: PreviewProps): JSX.Element {
  const objectURL = useMemo(
    () => (file !== undefined ? URL.createObjectURL(file) : undefined),
    [file]
  );
  const mimeType = useMemo(() => file.type, [file]);
  const query = useMemo(
    () =>
      match(mimeType)
        .with(MIME_TYPES.CSV, () => "SELECT * FROM CSV(?, {autoExt: false})")
        .with(MIME_TYPES.XLS, () => "SELECT * FROM XLS(?, {autoExt: false})")
        .with(MIME_TYPES.XLSX, () => "SELECT * FROM XLSX(?, {autoExt: false})")
        .otherwise(() => "SELECT * FROM ?"),
    [mimeType]
  );

  const fetchStatus = useQuery({
    queryKey: [query, objectURL],
    queryFn: async () =>
      alasql.promise<Record<string, unknown>[]>(query, [objectURL]), // TODO: Handle CSV with BOM
  });

  const dynamicColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      fetchStatus.status === "success" && fetchStatus.data.length > 0
        ? Object.keys(fetchStatus.data[0]).map(
            (key) =>
              ({
                id: key,
                accessorKey: key,
                header: ({ column }) => (
                  <DataTableColumnHeader column={column} title={key} />
                ),
              } satisfies ColumnDef<Record<string, unknown>>)
          )
        : [],
    [fetchStatus.status, fetchStatus.data]
  );

  useEffect(
    () => () => {
      if (objectURL !== undefined) URL.revokeObjectURL(objectURL);
    },
    [objectURL]
  );

  if (fetchStatus.status === "pending")
    return <LoaderCircle className="animate-spin" />;

  if (fetchStatus.status === "error")
    return (
      <Alert
        variant="destructive"
        className="w-full max-w-md border-destructive"
      >
        <AlertCircleIcon />
        <AlertTitle>An error occurred while fetching the data</AlertTitle>
        <AlertDescription>{fetchStatus.error.message}</AlertDescription>
      </Alert>
    );

  return (
    <DataTable
      columns={[selectableColumn, ...dynamicColumns]}
      data={fetchStatus.data}
    />
  );
}

export default Preview;
