import type { DataEdge } from "@/components/data-edge";
import { type Node } from "@xyflow/react";

export type FileNodeData = {
  label: string;
  file: File;
};

export const FILE_NODE_TYPE = "file";
export type FileNodeType = typeof FILE_NODE_TYPE;
export type FileNode = Node<FileNodeData, FileNodeType>;

export const TABLE_EDGE_TYPE = "table";
export type TableEdgeType = typeof TABLE_EDGE_TYPE;

export type NodeData = FileNodeData;
export type NodeType = FileNodeType;
export type AppNode = FileNode;

export type AppEdge = DataEdge<AppNode>;
