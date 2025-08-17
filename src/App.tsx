import { type JSX } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactFlowProvider } from "@xyflow/react";
import Page from "@/components/app";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/utils/query";

export default function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactFlowProvider>
        <Page />
        <Toaster position="bottom-right" />
      </ReactFlowProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
