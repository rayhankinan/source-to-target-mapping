import type { JSX } from "react";
import DataTable from "@/components/features/table/data-table";

export default function PreviewEmpty(): JSX.Element {
  return <DataTable status="success" columns={[]} data={[]} />;
}
