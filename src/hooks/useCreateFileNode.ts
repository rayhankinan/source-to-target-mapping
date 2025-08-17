import { useMutation } from "@tanstack/react-query";
import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { uniqueId } from "lodash";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow";
import { FILE_NODE_TYPE } from "@/types/flow";
import { db } from "@/utils/db";

export default function useCreateFileNode() {
  const { addNode } = useFlowStore(
    useShallow((state) => ({
      addNode: state.addNode,
    }))
  );

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      await db.registerFileHandle(
        file.name,
        file,
        DuckDBDataProtocol.BROWSER_FILEREADER,
        true
      );
    },
    onSuccess: (_, { file }) => {
      const id = uniqueId("file_");

      addNode({
        id,
        position: { x: 0, y: 0 },
        type: FILE_NODE_TYPE,
        data: { label: file.name, file },
      });
    },
    onError: (_, { file }) => {
      toast.error(`Failed to upload file ${file.name}. Please try again.`);
    },
  });
}
