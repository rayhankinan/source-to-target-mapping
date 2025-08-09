import { useCallback, type JSX } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type OnNodesDelete,
} from "@xyflow/react";
import { useMutation } from "@tanstack/react-query";
import { useAsyncQueuer } from "@tanstack/react-pacer/async-queuer";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow";
import alasql from "alasql";
import { toast } from "sonner";
import AppPanel from "@/components/features/diagram/panel";
import type { AppNode } from "@/types/flow";

export default function AppFlow(): JSX.Element {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useFlowStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
      }))
    );

  const { mutateAsync: dropTableAsync } = useMutation({
    mutationFn: async ({ label }: { label: string }) => {
      await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
    },
    onError: (_, { label }) => {
      toast.error(`Failed to drop table ${label}`);
    },
  });

  const { addItem } = useAsyncQueuer(
    async ({ label }: { label: string }) => {
      await dropTableAsync({ label });
    },
    {
      concurrency: 1,
    }
  );

  const onNodesDelete: OnNodesDelete<AppNode> = useCallback(
    (nodes) => {
      nodes.forEach((node) => {
        addItem({ label: node.id });
      });
    },
    [addItem]
  );

  return (
    <div className="container mx-auto h-180 rounded-md border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <AppPanel />
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
