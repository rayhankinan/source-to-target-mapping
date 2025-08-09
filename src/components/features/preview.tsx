import { useEffect, useMemo, useState, type JSX } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import alasql from "alasql";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/features/data-table";
import DataTableColumnHeader from "@/components/features/data-table-column-header";
import selectableColumn from "@/components/features/columns";
import { MIME_TYPES } from "@/const/mime-types";
import { sanitizeTableName } from "@/utils/sanitize";

interface PreviewProps {
  file: File;
}

export default function Preview({ file }: PreviewProps): JSX.Element {
  const tableName = useMemo(() => sanitizeTableName(file.name), [file.name]);
  const createQuery = useMemo(
    () =>
      match(file.type)
        .with(
          MIME_TYPES.CSV,
          () => `SELECT * INTO ${tableName} FROM CSV(?, {autoExt: false})` // TODO: Handle CSV with BOM
        )
        .with(
          MIME_TYPES.XLS,
          () => `SELECT * INTO ${tableName} FROM XLS(?, {autoExt: false})`
        )
        .with(
          MIME_TYPES.XLSX,
          () => `SELECT * INTO ${tableName} FROM XLSX(?, {autoExt: false})`
        )
        .otherwise(() => `SELECT * INTO ${tableName} FROM ?`),
    [file.type, tableName]
  );

  const [selectQuery, setSelectQuery] = useState<string>(
    `SELECT * FROM ${tableName}`
  );

  const initializeDatabaseMutation = useMutation({
    mutationFn: async () => {
      await alasql.promise("DROP INDEXEDDB DATABASE IF EXISTS fusion");
      await alasql.promise("CREATE INDEXEDDB DATABASE IF NOT EXISTS fusion");
      await alasql.promise("ATTACH INDEXEDDB DATABASE fusion");
      await alasql.promise("USE fusion");
    },
    onError: (error) => {
      console.error("Error initializing database:", error);
    },
  });

  const { mutate: initializeDatabase, status: initializeStatus } =
    initializeDatabaseMutation;

  const createTableMutation = useMutation({
    mutationFn: async (file: File) => {
      const objectURL = URL.createObjectURL(file);

      try {
        await alasql.promise(`DROP TABLE IF EXISTS ${tableName}`);
        await alasql.promise(`CREATE TABLE IF NOT EXISTS ${tableName}`);
        await alasql.promise(createQuery, [objectURL]);
      } finally {
        URL.revokeObjectURL(objectURL);
      }
    },
    onSuccess: (_, file) => {
      const tableName = sanitizeTableName(file.name);
      setSelectQuery(`SELECT * FROM ${tableName}`);
    },
    onError: (error) => {
      console.error("Error executing create table query:", error);
    },
  });

  const { mutate: createTable, status: createTableStatus } =
    createTableMutation;

  const fetchStatus = useQuery({
    queryKey: [selectQuery],
    queryFn: async () => alasql.promise<Record<string, unknown>[]>(selectQuery),
    placeholderData: keepPreviousData,
    enabled: createTableStatus === "success",
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

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  useEffect(() => {
    if (initializeStatus === "success") createTable(file);
  }, [file, createTable, initializeStatus]);

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
