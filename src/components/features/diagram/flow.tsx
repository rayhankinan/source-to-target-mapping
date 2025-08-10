import { useCallback, useState, type JSX } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeMouseHandler,
  type OnNodesDelete,
} from "@xyflow/react";
import { useMutation } from "@tanstack/react-query";
import { useAsyncQueuer } from "@tanstack/react-pacer/async-queuer";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow";
import alasql from "alasql";
import { toast } from "sonner";
import { Download, Rows4 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import AppPanel from "@/components/features/diagram/panel";
import PreviewDialog from "@/components/features/diagram/preview-dialog";
import type { AppNode } from "@/types/flow";

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
              <ContextMenuItem className="cursor-pointer disabled:cursor-not-allowed">
                Download
                <ContextMenuShortcut>
                  <Download />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
            <PreviewDialog
              data={expandedNode.data}
              open={openPreview}
              onOpenChange={setOpenPreview}
            />
          </>
        )}
      </ContextMenu>
    </div>
  );
}
