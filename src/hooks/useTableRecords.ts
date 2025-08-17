import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db";

export default function useTableRecords(selectQuery: string) {
  return useQuery({
    queryKey: [selectQuery],
    queryFn: async () => {
      const conn = await db.connect();

      try {
        const arrowResult = await conn.query(selectQuery);
        const result = arrowResult.toArray();
        return result;
      } finally {
        await conn.close();
      }
    },
    placeholderData: keepPreviousData,
  });
}
