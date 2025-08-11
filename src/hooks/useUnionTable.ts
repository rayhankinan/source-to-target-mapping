import { useMutation } from "@tanstack/react-query";
import alasql from "alasql";
import { toast } from "sonner";

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
      const dataA = await alasql.promise(qA);
      const dataB = await alasql.promise(qB);

      await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
      await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);

      const dataRes = await alasql.promise(
        `SELECT * FROM ? UNION ALL SELECT * FROM ?`,
        [dataA, dataB]
      );

      await alasql.promise(`SELECT * INTO ${label} FROM ?`, [dataRes]);
    },
    onError: (_, { label }) => {
      toast.error(`Error updating table data for ${label}`);
    },
  });
}
