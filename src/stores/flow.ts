import { TABLE_EDGE_TYPE, type AppEdge, type AppNode } from "@/types/flow";
import {
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { create } from "zustand";

export type AppState = {
  nodes: AppNode[];
  edges: AppEdge[];
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange<AppEdge>;
  onConnect: OnConnect;
  addNode: (node: AppNode) => void;
  addEdge: (edge: AppEdge) => void;
};

const useFlowStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          type: TABLE_EDGE_TYPE,
          data: { key: "label" },
          ...connection,
        },
        get().edges
      ),
    });
  },
  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },
  addEdge: (edge) => {
    set({ edges: [...get().edges, edge] });
  },
}));

export default useFlowStore;
