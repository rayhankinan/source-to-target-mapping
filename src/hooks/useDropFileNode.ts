import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/utils/db";

export default function useDropFileNode() {
  return useMutation({
    mutationFn: async ({ label }: { label: string }) => {
      await db.dropFile(label);
    },
    onError: (_, { label }) => {
      toast.error(`Failed to drop file ${label}`);
    },
  });
}
