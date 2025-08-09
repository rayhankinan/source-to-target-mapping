import _ from "lodash";

/** Remove file extension and invalid characters */
export function sanitizeTableName(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, ""); // Strip extension
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_]/g, "_"); // Replace special chars
  const prepended = /^[a-zA-Z_]/.test(sanitized)
    ? sanitized
    : `tbl_${sanitized}`; // Prepend if starts with digit
  return _.uniqueId(`${prepended}_`); // Ensure unique name
}
