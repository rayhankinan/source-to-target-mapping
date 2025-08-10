import { type JSX } from "react";
import AppFlow from "@/components/features/diagram/flow";

export default function Page(): JSX.Element {
  return (
    <main className="flex flex-col items-center justify-center gap-6 h-screen py-8 box-border">
      <AppFlow />
    </main>
  );
}
