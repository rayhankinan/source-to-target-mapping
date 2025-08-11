import { useCallback, useState, type JSX } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type IsValidConnection,
  type NodeMouseHandler,
  type OnNodesDelete,
} from "@xyflow/react";
import { useAsyncQueuer } from "@tanstack/react-pacer/async-queuer";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow";
import { Rows4 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { DataEdge } from "@/components/data-edge";
import AppPanel from "@/components/features/diagram/panel";
import PreviewDialog from "@/components/features/diagram/preview-dialog";
import FileNode from "@/components/features/node/file-node";
import UnionNode from "@/components/features/node/union-node";
import useDropTable from "@/hooks/useDropTable";
import {
  FILE_NODE_TYPE,
  TABLE_EDGE_TYPE,
  UNION_NODE_TYPE,
  type AppEdge,
  type AppNode,
} from "@/types/flow";

export default function AppFlow(): JSX.Element {
  const [expandedNode, setExpandedNode] = useState<AppNode | null>(null);
  const [openPreview, setOpenPreview] = useState(false);

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

  const { mutateAsync: dropTableAsync } = useDropTable();

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

  const onNodeContextMenu: NodeMouseHandler<AppNode> = useCallback(
    (_, node) => {
      setExpandedNode(node);
    },
    []
  );

  const onPaneClick = useCallback(
    () => setExpandedNode(null),
    [setExpandedNode]
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
      <ContextMenu>
        <ContextMenuTrigger>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onNodesDelete={onNodesDelete}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            isValidConnection={isValidConnection}
            nodeTypes={{
              [FILE_NODE_TYPE]: FileNode,
              [UNION_NODE_TYPE]: UnionNode,
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
        </ContextMenuTrigger>
        {expandedNode && (
          <>
            <ContextMenuContent className="w-48">
              <ContextMenuItem
                className="cursor-pointer disabled:cursor-not-allowed"
                onClick={() => setOpenPreview(true)}
              >
                Preview
                <ContextMenuShortcut>
                  <Rows4 />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
            <PreviewDialog
              node={expandedNode}
              open={openPreview}
              onOpenChange={setOpenPreview}
            />
          </>
        )}
      </ContextMenu>
    </div>
  );
}
