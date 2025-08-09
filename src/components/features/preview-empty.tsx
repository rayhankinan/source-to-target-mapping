import type { JSX } from "react";
import DataTable from "@/components/features/data-table";

export default function PreviewEmpty(): JSX.Element {
  return <DataTable status="success" columns={[]} data={[]} />;
}
