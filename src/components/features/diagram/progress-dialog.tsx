import { useCallback, useEffect, useMemo, type JSX } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAsyncQueuer } from "@tanstack/react-pacer/async-queuer";
import alasql from "alasql";
import { match } from "ts-pattern";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useFlowStore from "@/stores/flow";
import { sanitizeTableName } from "@/utils/sanitize";
import { MIME_TYPES } from "@/const/mime-types";
import { Progress } from "@/components/ui/progress";
import { FILE_NODE_TYPE } from "@/types/flow";

interface ProgressDialogProps {
  fileList: File[];
  resetFileList: () => void;
}

export default function ProgressDialog({
  fileList,
  resetFileList,
}: ProgressDialogProps): JSX.Element {
  const { addNode } = useFlowStore(
    useShallow((state) => ({
      addNode: state.addNode,
    }))
  );

  const open = useMemo(() => fileList.length > 0, [fileList.length]);

  const { mutateAsync: createTableAsync } = useMutation({
    mutationFn: async ({ label, file }: { label: string; file: File }) => {
      const objectURL = URL.createObjectURL(file);

      try {
        await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
        await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);
        await alasql.promise(
          match(file.type)
            .with(
              MIME_TYPES.CSV,
              () => `SELECT * INTO ${label} FROM CSV(?, {autoExt: false})` // TODO: Handle CSV with BOM
            )
            .with(
              MIME_TYPES.XLS,
              () => `SELECT * INTO ${label} FROM XLS(?, {autoExt: false})`
            )
            .with(
              MIME_TYPES.XLSX,
              () => `SELECT * INTO ${label} FROM XLSX(?, {autoExt: false})`
            )
            .otherwise(() => `SELECT * INTO ${label} FROM ?`),
          [objectURL]
        );
      } finally {
        URL.revokeObjectURL(objectURL);
      }
    },
    onError: (_, { label }) => {
      toast.error(`Failed to create table ${label}. Please try again.`);
    },
  });

  const { addItem, reset, state } = useAsyncQueuer(
    async ({ id, label, file }: { id: string; label: string; file: File }) => {
      await createTableAsync({
        label,
        file,
      });

      addNode({
        id,
        position: { x: 0, y: 0 },
        type: FILE_NODE_TYPE,
        data: { label, file },
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
        id: tableName,
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
