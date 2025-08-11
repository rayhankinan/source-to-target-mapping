import { useMutation } from "@tanstack/react-query";
import alasql from "alasql";
import { toast } from "sonner";

export default function useClearTable() {
  return useMutation({
    mutationFn: async ({ label }: { label: string }) => {
      await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
      await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);
    },
    onError: (_, { label }) => {
      toast.error(`Failed to drop table ${label}`);
    },
  });
}
