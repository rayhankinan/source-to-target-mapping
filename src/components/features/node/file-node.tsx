import { useCallback, type JSX } from "react";
import { type NodeProps, Position } from "@xyflow/react";
import { Download, EllipsisVertical } from "lucide-react";
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
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import useDownloadTable from "@/hooks/useDownloadTable";
import { type FileNode } from "@/types/flow";

export default function FileNode({ data }: NodeProps<FileNode>): JSX.Element {
  const { mutate: downloadTable } = useDownloadTable();

  const onClickDownload = useCallback(() => {
    downloadTable({
      label: data.label,
      type: data.file.type,
    });
  }, [data.file.type, data.label, downloadTable]);

  return (
    <BaseNode>
      <BaseNodeHeader className="flex flex-row w-full gap-2 border-b">
        <BaseNodeHeaderTitle className="text-md font-bold font-mono">
          Source Table
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
          </DropdownMenuContent>
        </DropdownMenu>
      </BaseNodeHeader>
      <BaseNodeContent className="flex flex-col w-full">
        <p className="text-xs font-normal font-mono">
          {data.label} ({data.file.name})
        </p>
      </BaseNodeContent>
      <BaseNodeFooter className="items-end px-0 w-full">
        <LabeledHandle title="out" type="source" position={Position.Right} />
      </BaseNodeFooter>
    </BaseNode>
  );
}
