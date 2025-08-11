import { useMutation } from "@tanstack/react-query";
import alasql from "alasql";
import { toast } from "sonner";

export default function useInitializeDatabase() {
  return useMutation({
    mutationFn: async () => {
      await alasql.promise("DROP INDEXEDDB DATABASE IF EXISTS fusion");
      await alasql.promise("CREATE INDEXEDDB DATABASE IF NOT EXISTS fusion");
      await alasql.promise("ATTACH INDEXEDDB DATABASE fusion");
      await alasql.promise("USE fusion");
    },
    onError: () => {
      toast.error("Failed to initialize database. Please try again.");
    },
  });
}
