import { useCallback, type JSX } from "react";
import { match } from "ts-pattern";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type IsValidConnection,
  type OnNodesDelete,
} from "@xyflow/react";
import { useAsyncQueuer } from "@tanstack/react-pacer/async-queuer";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow";
import { DataEdge } from "@/components/data-edge";
import AppPanel from "@/components/features/diagram/panel";
import FileNode from "@/components/features/node/file-node";
import UnionNode from "@/components/features/node/union-node";
import JoinNode from "@/components/features/node/join-node";
import useDropTableNode from "@/hooks/useDropTableNode";
import useDropFileNode from "@/hooks/useDropFileNode";
import {
  FILE_NODE_TYPE,
  JOIN_NODE_TYPE,
  TABLE_EDGE_TYPE,
  UNION_NODE_TYPE,
  type AppEdge,
  type AppNode,
  type AppNodeType,
} from "@/types/flow";

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

  const { mutateAsync: dropTableNodeAsync } = useDropTableNode();
  const { mutateAsync: dropFileNodeAsync } = useDropFileNode();

  const { addItem } = useAsyncQueuer(
    async ({ type, label }: { type: AppNodeType; label: string }) => {
      await match(type)
        .with(FILE_NODE_TYPE, async () => {
          return await dropFileNodeAsync({ label });
        })
        .otherwise(async () => {
          await dropTableNodeAsync({
            label,
          });
        });
    },
    {
      concurrency: 1,
    }
  );

  const onNodesDelete: OnNodesDelete<AppNode> = useCallback(
    (nodes) => {
      nodes.forEach((node) => {
        addItem({ type: node.type, label: node.id });
      });
    },
    [addItem]
  );

  const isValidConnection: IsValidConnection<AppEdge> = useCallback(
    (connection) => {
      const isTargetConnected = edges.some(
        (edge) =>
          edge.target === connection.target &&
          edge.targetHandle === connection.targetHandle
      );

      return !isTargetConnected;
    },
    [edges]
  );

  return (
    <div className="container mx-auto h-full rounded-md border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={{
          [FILE_NODE_TYPE]: FileNode,
          [UNION_NODE_TYPE]: UnionNode,
          [JOIN_NODE_TYPE]: JoinNode,
        }}
        edgeTypes={{
          [TABLE_EDGE_TYPE]: DataEdge,
        }}
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
