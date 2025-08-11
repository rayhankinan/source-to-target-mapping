import { type Node, type Edge } from "@xyflow/react";
import {
  type FileNodeType,
  type FileNodeData,
} from "@/components/features/node/file-node";

export type NodeData = FileNodeData;
export type NodeType = FileNodeType;

export type EdgeData = Record<string, unknown>;
export type EdgeType = undefined;

export type AppNode = Node<NodeData, NodeType>;
export type AppEdge = Edge<EdgeData, EdgeType>;
