import { type Edge, type Node } from "@xyflow/react";

export type NodeData = {
  label: string;
  file: File;
};
export type NodeType = undefined;
export type EdgeData = Record<string, unknown>;
export type EdgeType = undefined;
export type AppNode = Node<NodeData, NodeType>;
export type AppEdge = Edge<EdgeData, EdgeType>;
