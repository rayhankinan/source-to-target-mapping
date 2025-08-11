import { keepPreviousData, useQuery } from "@tanstack/react-query";
import alasql from "alasql";

export default function useTableRecords(selectQuery: string) {
  return useQuery({
    queryKey: [selectQuery],
    queryFn: async () => alasql.promise<Record<string, unknown>[]>(selectQuery),
    placeholderData: keepPreviousData,
  });
}
