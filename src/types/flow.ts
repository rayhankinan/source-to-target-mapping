import type { DataEdge } from "@/components/data-edge";
import { type Node } from "@xyflow/react";

export type BasicNodeData = {
  label: string;
};

export type FileNodeData = BasicNodeData & {
  file: File;
};
export const FILE_NODE_TYPE = "file";
export type FileNodeType = typeof FILE_NODE_TYPE;
export type FileNode = Node<FileNodeData, FileNodeType>;

export type UnionNodeData = BasicNodeData;
export const UNION_NODE_TYPE = "union";
export type UnionNodeType = typeof UNION_NODE_TYPE;
export type UnionNode = Node<UnionNodeData, UnionNodeType>;

export type JoinNodeData = BasicNodeData;
export const JOIN_NODE_TYPE = "join";
export type JoinNodeType = typeof JOIN_NODE_TYPE;
export type JoinNode = Node<JoinNodeData, JoinNodeType>;

export type TableNodeType = UnionNodeType | JoinNodeType;

export const TABLE_EDGE_TYPE = "table";
export type TableEdgeType = typeof TABLE_EDGE_TYPE;

export type AppNode = FileNode | UnionNode | JoinNode;
export type AppEdge = DataEdge<AppNode>;
