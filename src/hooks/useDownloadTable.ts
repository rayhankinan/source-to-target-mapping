import { useMutation } from "@tanstack/react-query";
import XLSX, { type WorkBook } from "xlsx";
import alasql from "alasql";
import { match } from "ts-pattern";
import { toast } from "sonner";
import { MIME_TYPES } from "@/const/mime-types";

export default function useDownloadTable() {
  return useMutation({
    mutationFn: async ({ label, type }: { label: string; type: string }) =>
      match(type)
        .with(MIME_TYPES.CSV, async () => {
          const rawString = await alasql.promise<string>(
            `SELECT * INTO CSV({headers:true}) FROM ${label}`
          );

          const blob = new Blob([rawString], {
            type: MIME_TYPES.CSV,
          });

          return blob;
        })
        .with(MIME_TYPES.XLS, async () => {
          const wb = await alasql.promise<WorkBook>(
            `SELECT * INTO XLSX({headers:true}) FROM ${label}`
          );

          const u8Array: ArrayBuffer = XLSX.write(wb, {
            bookType: "xls",
            type: "array",
          });

          const blob = new Blob([u8Array], {
            type: MIME_TYPES.XLS,
          });

          return blob;
        })
        .with(MIME_TYPES.XLSX, async () => {
          const wb = await alasql.promise<WorkBook>(
            `SELECT * INTO XLSX({headers:true}) FROM ${label}`
          );

          const u8Array: ArrayBuffer = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
          });

          const blob = new Blob([u8Array], {
            type: MIME_TYPES.XLSX,
          });

          return blob;
        })
        .otherwise(async () => alasql.promise<Blob>(`SELECT * FROM ${label}`)),
    onSuccess: (data, { label }) => {
      const extension = match(data.type)
        .with(MIME_TYPES.CSV, () => "csv")
        .with(MIME_TYPES.XLS, () => "xls")
        .with(MIME_TYPES.XLSX, () => "xlsx")
        .otherwise(() => "txt");

      const url = URL.createObjectURL(data);

      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${label}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    onError: (_, { label }) => {
      toast.error(`Failed to download the file ${label}.`);
    },
  });
}
