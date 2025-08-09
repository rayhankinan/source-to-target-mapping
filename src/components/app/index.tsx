import { memo, type JSX } from "react";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow";
import Preview from "@/components/features/table/preview";
import AppFlow from "@/components/features/diagram/flow";

const MemoizedPreview = memo(Preview);

export default function Page(): JSX.Element {
  const selectedNode = useFlowStore(
    useShallow((state) => state.nodes.filter((node) => node.selected))
  );

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 py-8">
      <AppFlow />
      {selectedNode.map((node) => (
        <MemoizedPreview key={node.id} data={node.data} />
      ))}
    </main>
  );
}
