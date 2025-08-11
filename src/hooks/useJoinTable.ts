import { useMutation } from "@tanstack/react-query";
import alasql from "alasql";
import { toast } from "sonner";

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
      const dataA = await alasql.promise(qA);
      const dataB = await alasql.promise(qB);

      await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
      await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);

      const joinCondition = columns
        .map((column) => `A.${column} = B.${column}`)
        .join(" AND ");

      const dataRes = await alasql.promise(
        `SELECT * FROM ? AS A INNER JOIN ? AS B ON ${joinCondition}`,
        [dataA, dataB]
      );

      await alasql.promise(`SELECT * INTO ${label} FROM ?`, [dataRes]);
    },
    onError: (_, { label }) => {
      toast.error(`Error updating table data for ${label}`);
    },
  });
}
