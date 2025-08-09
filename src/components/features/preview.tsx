import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import alasql from "alasql";
import _ from "lodash";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/features/data-table";
import DataTableColumnHeader from "@/components/features/data-table-column-header";
import selectableColumn from "@/components/features/columns";
import { MIME_TYPES } from "@/const/mime-types";

interface PreviewProps {
  file: File;
}

function Preview({ file }: PreviewProps): JSX.Element {
  const mimeType = useMemo(() => file.type, [file]);
  const defaultQuery = useMemo(
    () =>
      match(mimeType)
        .with(MIME_TYPES.CSV, () => "SELECT * FROM CSV(?, {autoExt: false})")
        .with(MIME_TYPES.XLS, () => "SELECT * FROM XLS(?, {autoExt: false})")
        .with(MIME_TYPES.XLSX, () => "SELECT * FROM XLSX(?, {autoExt: false})")
        .otherwise(() => "SELECT * FROM ?"),
    [mimeType]
  );

  const [query, setQuery] = useState<string>(defaultQuery);

  const fetchStatus = useQuery({
    queryKey: [query, file.name],
    queryFn:
      query !== undefined
        ? async () => {
            const objectURL = URL.createObjectURL(file);

            try {
              return await alasql.promise<Record<string, unknown>[]>(query, [
                objectURL,
              ]); // TODO: Handle CSV with BOM
            } finally {
              URL.revokeObjectURL(objectURL);
            }
          }
        : skipToken,
    placeholderData: keepPreviousData,
  });

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

  const onQueryChange = useCallback((newQuery: string) => {
    try {
      alasql.parse(newQuery);
      setQuery(newQuery);
    } catch (error) {
      console.error("Invalid query:", error);
    }
  }, []);

  const debounceQueryChange = useMemo(
    () => _.debounce(onQueryChange, 1000),
    [onQueryChange]
  );

  useEffect(() => setQuery(defaultQuery), [defaultQuery]);

  if (fetchStatus.status === "pending")
    return (
      <DataTable
        status="pending"
        columns={[selectableColumn, ...dynamicColumns]}
        defaultQuery={defaultQuery}
        onQueryChange={debounceQueryChange}
      />
    );

  if (fetchStatus.status === "error")
    return (
      <DataTable
        status="error"
        error={fetchStatus.error}
        columns={[selectableColumn, ...dynamicColumns]}
        defaultQuery={defaultQuery}
        onQueryChange={debounceQueryChange}
      />
    );

  return (
    <DataTable
      status="success"
      columns={[selectableColumn, ...dynamicColumns]}
      data={fetchStatus.data}
      defaultQuery={defaultQuery}
      onQueryChange={debounceQueryChange}
    />
  );
}

export default Preview;
