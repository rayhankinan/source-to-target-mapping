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
import { useMutation } from "@tanstack/react-query";
import { useAsyncQueuer } from "@tanstack/react-pacer/async-queuer";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow";
import alasql from "alasql";
import XLSX, { type WorkBook } from "xlsx";
import { match } from "ts-pattern";
import { toast } from "sonner";
import { Download, Rows4 } from "lucide-react";
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
import {
  FILE_NODE_TYPE,
  TABLE_EDGE_TYPE,
  UNION_NODE_TYPE,
  type AppEdge,
  type AppNode,
} from "@/types/flow";
import { MIME_TYPES } from "@/const/mime-types";

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

  const { mutate: mutateDownload } = useMutation({
    mutationFn: async ({ label, type }: { label: string; type: string }) =>
      match(type)
        .with(MIME_TYPES.CSV, async () => {
          const rawString = await alasql.promise<string>(
            `SELECT * INTO CSV({headers:true}) FROM ${label}`
          );

          const blob = new Blob([rawString], {
            type: MIME_TYPES.CSV,
          });

          return blob;
        })
        .with(MIME_TYPES.XLS, async () => {
          const wb = await alasql.promise<WorkBook>(
            `SELECT * INTO XLSX({headers:true}) FROM ${label}`
          );

          const u8Array: ArrayBuffer = XLSX.write(wb, {
            bookType: "xls",
            type: "array",
          });

          const blob = new Blob([u8Array], {
            type: MIME_TYPES.XLS,
          });

          return blob;
        })
        .with(MIME_TYPES.XLSX, async () => {
          const wb = await alasql.promise<WorkBook>(
            `SELECT * INTO XLSX({headers:true}) FROM ${label}`
          );

          const u8Array: ArrayBuffer = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
          });

          const blob = new Blob([u8Array], {
            type: MIME_TYPES.XLSX,
          });

          return blob;
        })
        .otherwise(async () => alasql.promise<Blob>(`SELECT * FROM ${label}`)),
    onSuccess: (data, { label }) => {
      const extension = match(data.type)
        .with(MIME_TYPES.CSV, () => "csv")
        .with(MIME_TYPES.XLS, () => "xls")
        .with(MIME_TYPES.XLSX, () => "xlsx")
        .otherwise(() => "txt");

      const url = URL.createObjectURL(data);

      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${label}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    onError: (_, { label }) => {
      toast.error(`Failed to download the file ${label}.`);
    },
  });

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
              <ContextMenuItem
                className="cursor-pointer disabled:cursor-not-allowed"
                onClick={() =>
                  mutateDownload({
                    label: expandedNode.data.label,
                    type:
                      expandedNode.type === FILE_NODE_TYPE
                        ? expandedNode.data.file.type
                        : MIME_TYPES.CSV,
                  })
                }
              >
                Download
                <ContextMenuShortcut>
                  <Download />
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
