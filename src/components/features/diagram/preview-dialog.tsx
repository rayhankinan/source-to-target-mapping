import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Preview from "@/components/features/table/preview";
import type { NodeData } from "@/types/flow";

interface PreviewDialogProps {
  data: NodeData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PreviewDialog({
  data,
  open,
  onOpenChange,
}: PreviewDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Preview Table</DialogTitle>
          <DialogDescription>{data.label}</DialogDescription>
        </DialogHeader>
        <Preview data={data} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
