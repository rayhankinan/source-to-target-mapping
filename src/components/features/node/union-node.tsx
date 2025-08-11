import { useEffect, type JSX } from "react";
import {
  type InternalNode,
  type Node,
  type NodeConnection,
  type NodeProps,
  Position,
  useReactFlow,
  useStore,
} from "@xyflow/react";
import { useMutation } from "@tanstack/react-query";
import alasql from "alasql";
import { toast } from "sonner";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import { FILE_NODE_TYPE, type FileNode, type UnionNode } from "@/types/flow";

function getInternalFileNode(
  connections: NodeConnection[],
  nodeLookup: Map<string, InternalNode<Node>>
): string {
  return connections
    .map((connection) => nodeLookup.get(connection.source))
    .filter(
      (node): node is InternalNode<FileNode> =>
        node !== undefined && node.type === FILE_NODE_TYPE
    )
    .map((node) => `SELECT * FROM ${node.data.label}`)
    .join(" UNION ALL ");
}

export default function UnionNode({
  id,
  data,
}: NodeProps<UnionNode>): JSX.Element {
  const { getNodeConnections } = useReactFlow();

  const { qA, qB } = useStore((state) => ({
    qA: getInternalFileNode(
      getNodeConnections({
        nodeId: id,
        type: "target",
        handleId: "A",
      }),
      state.nodeLookup
    ),
    qB: getInternalFileNode(
      getNodeConnections({
        nodeId: id,
        type: "target",
        handleId: "B",
      }),
      state.nodeLookup
    ),
  }));

  const { mutate: updateTableData } = useMutation({
    mutationFn: async ({
      label,
      qA,
      qB,
    }: {
      label: string;
      qA: string;
      qB: string;
    }) => {
      const dataA = await alasql.promise(qA);
      const dataB = await alasql.promise(qB);

      await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
      await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);

      const dataRes = await alasql.promise(
        `SELECT * FROM ? UNION ALL SELECT * FROM ?`,
        [dataA, dataB]
      );

      await alasql.promise(`SELECT * INTO ${label} FROM ?`, [dataRes]);
    },
    onError: (_, { label }) => {
      toast.error(`Error updating table data for ${label}`);
    },
  });

  useEffect(() => {
    if (qA.length > 0 && qB.length > 0)
      updateTableData({
        label: data.label,
        qA,
        qB,
      });
  }, [qA, qB, data.label, updateTableData]);

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
