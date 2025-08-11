import { useMutation } from "@tanstack/react-query";
import alasql from "alasql";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { useShallow } from "zustand/react/shallow";
import { MIME_TYPES } from "@/const/mime-types";
import useFlowStore from "@/stores/flow";
import { FILE_NODE_TYPE } from "@/types/flow";

export default function useCreateFileNode() {
  const { addNode } = useFlowStore(
    useShallow((state) => ({
      addNode: state.addNode,
    }))
  );

  return useMutation({
    mutationFn: async ({ label, file }: { label: string; file: File }) => {
      const objectURL = URL.createObjectURL(file);

      try {
        await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
        await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);
        await alasql.promise(
          match(file.type)
            .with(
              MIME_TYPES.CSV,
              () => `SELECT * INTO ${label} FROM CSV(?, {autoExt: false})` // TODO: Handle CSV with BOM
            )
            .with(
              MIME_TYPES.XLS,
              () => `SELECT * INTO ${label} FROM XLS(?, {autoExt: false})`
            )
            .with(
              MIME_TYPES.XLSX,
              () => `SELECT * INTO ${label} FROM XLSX(?, {autoExt: false})`
            )
            .otherwise(() => `SELECT * INTO ${label} FROM ?`),
          [objectURL]
        );
      } finally {
        URL.revokeObjectURL(objectURL);
      }
    },
    onSuccess: (_, { label, file }) => {
      addNode({
        id: label,
        position: { x: 0, y: 0 },
        type: FILE_NODE_TYPE,
        data: { label, file },
      });
    },
    onError: (_, { label }) => {
      toast.error(`Failed to create table ${label}. Please try again.`);
    },
  });
}
