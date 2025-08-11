import type { JSX } from "react";
import { type NodeProps, Position } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import { type UnionNode } from "@/types/flow";

export default function UnionNode({ data }: NodeProps<UnionNode>): JSX.Element {
  return (
    <BaseNode>
      <BaseNodeHeader className="flex flex-col items-center border-b">
        <BaseNodeHeaderTitle className="text-md font-bold font-mono">
          Union
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent className="flex flex-col items-center">
        <p className="text-xs font-normal font-mono">{data.label}</p>
      </BaseNodeContent>
      <footer className="border-t">
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
