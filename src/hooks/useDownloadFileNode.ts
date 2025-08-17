import { useMutation } from "@tanstack/react-query";
import log from "loglevel";
import { toast } from "sonner";
import { MIME_TYPES } from "@/const/mime-types";
import { db } from "@/utils/db";

export default function useDownloadFileNode() {
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: file.name,
          types: [
            {
              description: "Spreadsheet files",
              accept: {
                [MIME_TYPES.CSV]: [".csv"],
                [MIME_TYPES.XLSX]: [".xlsx"],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();

        try {
          const buffer = await db.copyFileToBuffer(file.name);
          const arr = new Uint8Array(buffer);
          const blob = new Blob([arr], { type: file.type });
          await writable.write(blob);
        } finally {
          await writable.close();
        }
      } catch (error) {
        log.error(error);
      }
    },
    onError: (_, { file }) => {
      toast.error(`Failed to drop file ${file.name}`);
    },
  });
}
