import { useMutation } from "@tanstack/react-query";
import log from "loglevel";
import { toast } from "sonner";
import { MIME_TYPES } from "@/const/mime-types";
import { db } from "@/utils/db";

export default function useDownloadTableNode() {
  return useMutation({
    mutationFn: async ({ label, type }: { label: string; type: string }) => {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${label}.csv`,
          types: [
            {
              description: "CSV files",
              accept: {
                [MIME_TYPES.CSV]: [".csv"],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();

        try {
          const conn = await db.connect();

          try {
            await conn.query(`
          COPY ${label} 
          TO '${label}.csv' 
          (HEADER, FORMAT CSV)
        `);

            try {
              const buffer = await db.copyFileToBuffer(`${label}.csv`);
              const arr = new Uint8Array(buffer);
              const blob = new Blob([arr], { type });
              await writable.write(blob);
            } finally {
              await db.dropFile(`${label}.csv`);
            }
          } finally {
            await conn.close();
          }
        } finally {
          await writable.close();
        }
      } catch (error) {
        log.error(error);
      }
    },
    onError: (_, { label }) => {
      toast.error(`Failed to download the file ${label}.`);
    },
  });
}
