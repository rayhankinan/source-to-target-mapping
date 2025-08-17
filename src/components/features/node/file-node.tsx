import { useCallback, useState, type JSX } from "react";
import { type NodeProps, Position } from "@xyflow/react";
import { Download, EllipsisVertical, Rows4 } from "lucide-react";
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
import PreviewDialog from "@/components/features/diagram/preview-dialog";
import useDownloadFileNode from "@/hooks/useDownloadFileNode";
import { type FileNode } from "@/types/flow";

export default function FileNode({ data }: NodeProps<FileNode>): JSX.Element {
  const [openPreview, setOpenPreview] = useState(false);

  const { mutate: downloadFile } = useDownloadFileNode();

  const onClickDownload = useCallback(() => {
    downloadFile({
      file: data.file,
    });
  }, [data.file, downloadFile]);

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
              onClick={() => setOpenPreview(true)}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Preview File
              <DropdownMenuShortcut>
                <Rows4 />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onClickDownload}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Download File
              <DropdownMenuShortcut>
                <Download />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </BaseNodeHeader>
      <BaseNodeContent className="flex flex-col w-full">
        <p className="text-xs font-normal font-mono">{data.file.name}</p>
      </BaseNodeContent>
      <BaseNodeFooter className="items-end px-0 w-full">
        <LabeledHandle title="out" type="source" position={Position.Right} />
      </BaseNodeFooter>
      <PreviewDialog
        data={data}
        open={openPreview}
        onOpenChange={setOpenPreview}
      />
    </BaseNode>
  );
}
