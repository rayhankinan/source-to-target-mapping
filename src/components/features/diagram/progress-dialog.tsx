import { useCallback, useEffect, useMemo, type JSX } from "react";
import { useAsyncQueuer } from "@tanstack/react-pacer/async-queuer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sanitizeTableName } from "@/utils/sanitize";
import { Progress } from "@/components/ui/progress";
import useCreateFileNode from "@/hooks/useCreateFileNode";

interface ProgressDialogProps {
  fileList: File[];
  resetFileList: () => void;
}

export default function ProgressDialog({
  fileList,
  resetFileList,
}: ProgressDialogProps): JSX.Element {
  const open = useMemo(() => fileList.length > 0, [fileList.length]);

  const { mutateAsync: createFileNodeAsync } = useCreateFileNode();

  const { addItem, reset, state } = useAsyncQueuer(
    async ({ label, file }: { label: string; file: File }) => {
      await createFileNodeAsync({
        label,
        file,
      });
    },
    {
      concurrency: 1,
      onSettled: (_, queuer) => {
        if (queuer.store.state.activeItems.length === 0) resetFileList();
      },
    },
    (state) => ({
      activeItems: state.activeItems,
    })
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        reset();
        resetFileList();
      }
    },
    [reset, resetFileList]
  );

  const processedFiles = useMemo(
    () => fileList.length - state.activeItems.length,
    [fileList.length, state.activeItems.length]
  );

  const progress = useMemo(
    () => (fileList.length > 0 ? (100 * processedFiles) / fileList.length : 0),
    [processedFiles, fileList.length]
  );

  useEffect(() => {
    Array.from(fileList.length > 0 ? fileList : []).forEach((file) => {
      const tableName = sanitizeTableName(file.name);

      addItem({
        label: tableName,
        file,
      });
    });
  }, [addItem, fileList]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uploading files</DialogTitle>
          <DialogDescription>
            {processedFiles} of {fileList.length} files uploaded
          </DialogDescription>
        </DialogHeader>
        <Progress value={progress} className="w-full" />
      </DialogContent>
    </Dialog>
  );
}
