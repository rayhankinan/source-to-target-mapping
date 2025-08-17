import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db";

export default function useUnionTable() {
  return useMutation({
    mutationFn: async ({
      label,
      qA,
      qB,
    }: {
      label: string;
      qA: string;
      qB: string;
    }) => {
      const conn = await db.connect();

      try {
        await conn.query(
          `CREATE OR REPLACE TABLE ${label} AS (SELECT * FROM (${qA}) AS A UNION ALL SELECT * FROM (${qB}) AS B)`
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
