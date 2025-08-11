import { useCallback, useEffect, type JSX } from "react";
import {
  type InternalNode,
  type Node,
  type NodeConnection,
  type NodeProps,
  Position,
  useReactFlow,
  useStore,
} from "@xyflow/react";
import { Download, EllipsisVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import useDownloadTable from "@/hooks/useDownloadTable";
import useUnionTable from "@/hooks/useUnionTable";
import useClearTable from "@/hooks/useClearTable";
import { type AppNode, type UnionNode } from "@/types/flow";
import { MIME_TYPES } from "@/const/mime-types";

function getSQL(
  connections: NodeConnection[],
  nodeLookup: Map<string, InternalNode<Node>>
): string {
  return connections
    .map((connection) => nodeLookup.get(connection.source))
    .filter((node): node is InternalNode<AppNode> => node !== undefined)
    .map((node) => `SELECT * FROM ${node.data.label}`)
    .join(" UNION ALL ");
}

export default function UnionNode({
  id,
  data,
}: NodeProps<UnionNode>): JSX.Element {
  const { getNodeConnections } = useReactFlow();

  const { qA, qB } = useStore((state) => ({
    qA: getSQL(
      getNodeConnections({
        nodeId: id,
        type: "target",
        handleId: "A",
      }),
      state.nodeLookup
    ),
    qB: getSQL(
      getNodeConnections({
        nodeId: id,
        type: "target",
        handleId: "B",
      }),
      state.nodeLookup
    ),
  }));

  const { mutate: downloadTable } = useDownloadTable();
  const { mutate: unionTable } = useUnionTable();
  const { mutate: clearTable } = useClearTable();

  const onClickDownload = useCallback(() => {
    downloadTable({
      label: data.label,
      type: MIME_TYPES.CSV,
    });
  }, [data.label, downloadTable]);

  const onClickUpdate = useCallback(() => {
    if (qA.length === 0 || qB.length === 0) {
      clearTable({ label: data.label });
      return;
    }

    unionTable({
      label: data.label,
      qA,
      qB,
    });
  }, [qA, qB, data.label, unionTable, clearTable]);

  useEffect(() => {
    if (qA.length === 0 || qB.length === 0) {
      clearTable({ label: data.label });
      return;
    }

    unionTable({
      label: data.label,
      qA,
      qB,
    });
  }, [qA, qB, data.label, unionTable, clearTable]);

  return (
    <BaseNode>
      <BaseNodeHeader className="flex flex-row w-full gap-2 border-b">
        <BaseNodeHeaderTitle className="flex flex-row items-center text-md font-bold font-mono">
          Union
        </BaseNodeHeaderTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="nodrag w-6 h-6"
              aria-label="Node Actions"
              title="Node Actions"
            >
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={onClickDownload}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Download Table
              <DropdownMenuShortcut>
                <Download />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onClickUpdate}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Update Table
              <DropdownMenuShortcut>
                <RotateCcw />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </BaseNodeHeader>
      <BaseNodeContent className="flex flex-row w-full">
        <p className="text-xs font-normal font-mono">{data.label}</p>
      </BaseNodeContent>
      <footer className="border-t w-full">
        <LabeledHandle
          id="A"
          title="A"
          type="target"
          position={Position.Left}
        />
        <LabeledHandle
          id="B"
          title="B"
          type="target"
          position={Position.Left}
        />
        <LabeledHandle title="out" type="source" position={Position.Right} />
      </footer>
    </BaseNode>
  );
}
