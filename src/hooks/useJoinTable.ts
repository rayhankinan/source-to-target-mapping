import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db";

export default function useJoinTable() {
  return useMutation({
    mutationFn: async ({
      label,
      qA,
      qB,
      columns,
    }: {
      label: string;
      qA: string;
      qB: string;
      columns: string[];
    }) => {
      const conn = await db.connect();

      try {
        const joinCondition = columns
          .map((column) => `A.${column} = B.${column}`)
          .join(" AND ");

        await conn.query(
          `CREATE OR REPLACE TABLE ${label} AS (SELECT * FROM (${qA}) AS A JOIN (${qB}) AS B ON ${joinCondition})`
        );
      } finally {
        await conn.close();
      }
    },
    onError: (_, { label }) => {
      toast.error(`Error updating table data for ${label}`);
    },
  });
}
