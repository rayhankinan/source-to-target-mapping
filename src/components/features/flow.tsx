import { type JSX } from "react";
import { ReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow";

export default function Flow(): JSX.Element {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useFlowStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
      }))
    );

  return (
    <div className="container mx-auto h-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
