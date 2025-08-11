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
import type { AppNode } from "@/types/flow";

interface PreviewDialogProps {
  node: AppNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PreviewDialog({
  node,
  open,
  onOpenChange,
}: PreviewDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Preview Table</DialogTitle>
          <DialogDescription>{node.data.label}</DialogDescription>
        </DialogHeader>
        <Preview node={node} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
