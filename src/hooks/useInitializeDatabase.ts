import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db";

export default function useInitializeDatabase() {
  return useMutation({
    mutationFn: async () => {
      const conn = await db.connect();

      try {
        await conn.query("PRAGMA enable_verification");
        await conn.query("INSTALL excel FROM core_nightly");
        await conn.query("LOAD excel");
      } finally {
        await conn.close();
      }
    },
    onError: () => {
      toast.error(
        "Failed to initialize database. Please refresh the page to try again."
      );
    },
  });
}
