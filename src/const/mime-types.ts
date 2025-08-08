export const MIME_TYPES = {
  CSV: "text/csv",
  XLS: "application/vnd.ms-excel",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

export type MimeType = (typeof MIME_TYPES)[keyof typeof MIME_TYPES];
