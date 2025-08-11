import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import alasql from "alasql";
import { toast } from "sonner";
import useFlowStore from "@/stores/flow";
import type { TableNodeType } from "@/types/flow";

export default function useCreateTableNode() {
  const { addNode } = useFlowStore(
    useShallow((state) => ({
      addNode: state.addNode,
    }))
  );

  return useMutation({
    mutationFn: async ({ label }: { label: string; type: TableNodeType }) => {
      await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
      await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);
    },
    onSuccess: (_, { label, type }) => {
      addNode({
        id: label,
        position: { x: 0, y: 0 },
        type,
        data: {
          label,
        },
      });
    },
    onError: (_, { label }) => {
      toast.error(`Failed to create table ${label}. Please try again.`);
    },
  });
}
