import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import {
  type NodeProps,
  Position,
  useReactFlow,
  useStore,
} from "@xyflow/react";
import { Download, EllipsisVertical, RotateCcw, Rows4 } from "lucide-react";
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
import PreviewDialog from "@/components/features/diagram/preview-dialog";
import useDownloadTableNode from "@/hooks/useDownloadTableNode";
import useUnionTable from "@/hooks/useUnionTable";
import { type UnionNode } from "@/types/flow";
import { MIME_TYPES } from "@/const/mime-types";
import { getUnionSQL } from "@/lib/sql";

export default function UnionNode({
  id,
  data,
}: NodeProps<UnionNode>): JSX.Element {
  const [openPreview, setOpenPreview] = useState(false);

  const { getNodeConnections } = useReactFlow();
  const { qA, qB } = useStore((state) => ({
    qA: getUnionSQL(
      getNodeConnections({
        nodeId: id,
        type: "target",
        handleId: "A",
      }),
      state.nodeLookup
    ),
    qB: getUnionSQL(
      getNodeConnections({
        nodeId: id,
        type: "target",
        handleId: "B",
      }),
      state.nodeLookup
    ),
  }));

  const { mutate: downloadTable } = useDownloadTableNode();
  const { mutate: unionTable, status: unionStatus } = useUnionTable();

  const onClickDownload = useCallback(() => {
    downloadTable({
      label: data.label,
      type: MIME_TYPES.CSV,
    });
  }, [data.label, downloadTable]);

  const onClickUpdate = useCallback(() => {
    unionTable({
      label: data.label,
      qA,
      qB,
    });
  }, [data.label, qA, qB, unionTable]);

  const isDisabled = useMemo(
    () => qA.length === 0 || qB.length === 0 || unionStatus !== "success",
    [qA, qB, unionStatus]
  );

  useEffect(() => {
    if (qA.length === 0 || qB.length === 0) return;

    unionTable({
      label: data.label,
      qA,
      qB,
    });
  }, [qA, qB, data.label, unionTable]);

  return (
    <BaseNode>
      <BaseNodeHeader className="flex flex-row w-full gap-2 border-b">
        <BaseNodeHeaderTitle className="flex flex-row items-center text-md font-bold font-mono">
          Stack Tables
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
              onClick={() => setOpenPreview(true)}
              disabled={isDisabled}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Preview File
              <DropdownMenuShortcut>
                <Rows4 />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onClickDownload}
              disabled={isDisabled}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Download Table
              <DropdownMenuShortcut>
                <Download />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onClickUpdate}
              disabled={isDisabled}
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
      <BaseNodeContent className="flex flex-col w-full">
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
      <PreviewDialog
        data={data}
        open={openPreview}
        onOpenChange={setOpenPreview}
      />
    </BaseNode>
  );
}
