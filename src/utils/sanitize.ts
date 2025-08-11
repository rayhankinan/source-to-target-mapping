import _ from "lodash";

/**
 * Sanitize a table name by removing invalid characters and ensuring uniqueness.
 * @param filename The original table name.
 * @returns The sanitized table name.
 */
export function sanitizeTableName(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, ""); // Strip extension
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_]/g, "_"); // Replace special chars
  const prepended = /^[a-zA-Z_]/.test(sanitized)
    ? sanitized
    : `tbl_${sanitized}`; // Prepend if starts with digit
  return _.uniqueId(`${prepended}_`); // Ensure unique name
}
