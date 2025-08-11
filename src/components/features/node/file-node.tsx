import { type NodeProps, Position } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import { type FileNode } from "@/types/flow";

export default function FileNode({ data }: NodeProps<FileNode>) {
  return (
    <BaseNode>
      <BaseNodeHeader className="flex flex-col items-center border-b">
        <BaseNodeHeaderTitle className="text-md font-bold font-mono">
          Source
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent className="flex flex-col items-center">
        <p className="text-xs font-normal font-mono">
          {data.label} ({data.file.name})
        </p>
      </BaseNodeContent>
      <BaseNodeFooter className="flex flex-col items-center">
        <LabeledHandle title="out" type="source" position={Position.Right} />
      </BaseNodeFooter>
    </BaseNode>
  );
}
