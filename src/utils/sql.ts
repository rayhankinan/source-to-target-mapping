import type { InternalNode, Node, NodeConnection } from "@xyflow/react";
import type { AppNode } from "@/types/flow";

/**
 * Generate a SQL UNION ALL query from the given node connections.
 * @param connections The node connections to include in the query.
 * @param nodeLookup A map of node IDs to their internal representations.
 * @returns The generated SQL query.
 */
export function getUnionSQL(
  connections: NodeConnection[],
  nodeLookup: Map<string, InternalNode<Node>>
): string {
  return connections
    .map((connection) => nodeLookup.get(connection.source))
    .filter((node): node is InternalNode<AppNode> => node !== undefined)
    .map((node) => `SELECT * FROM ${node.data.label}`)
    .join(" UNION ALL ");
}
