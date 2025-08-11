import { useMemo, useState, type JSX } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import alasql from "alasql";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/features/table/data-table";
import DataTableColumnHeader from "@/components/features/table/data-table-column-header";
import selectableColumn from "@/components/features/table/columns";
import type { AppNode } from "@/types/flow";

interface PreviewProps {
  node: AppNode;
}

export default function Preview({ node }: PreviewProps): JSX.Element {
  const [selectQuery, setSelectQuery] = useState<string>(
    `SELECT * FROM ${node.data.label}`
  );

  const fetchStatus = useQuery({
    queryKey: [selectQuery],
    queryFn: async () => alasql.promise<Record<string, unknown>[]>(selectQuery),
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
