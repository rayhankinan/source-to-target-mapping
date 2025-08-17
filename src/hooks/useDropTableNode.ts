import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db";

export default function useDropTableNode() {
  return useMutation({
    mutationFn: async ({ label }: { label: string }) => {
      const conn = await db.connect();

      try {
        await conn.query(`DROP TABLE IF EXISTS ${label}`);
      } finally {
        await conn.close();
      }
    },
    onError: (_, { label }) => {
      toast.error(`Failed to drop table ${label}`);
    },
  });
}
