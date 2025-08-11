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
import type { AppNode } from "@/types/flow";
import { sanitizeTableName } from "@/utils/sanitize";
import { MIME_TYPES } from "@/const/mime-types";
import { Progress } from "@/components/ui/progress";

interface ProgressDialogProps {
  fileList: File[];
  resetFileList: () => void;
}

export default function ProgressDialog({
  fileList,
  resetFileList,
}: ProgressDialogProps): JSX.Element {
  const { nodes, setNodes } = useFlowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    }))
  );

  const open = useMemo(() => fileList.length > 0, [fileList.length]);

  const { mutateAsync: createTableAsync } = useMutation({
    mutationFn: async ({
      createQuery,
      label,
      file,
    }: {
      createQuery: string;
      label: string;
      file: File;
    }) => {
      const objectURL = URL.createObjectURL(file);

      try {
        await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
        await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);
        await alasql.promise(createQuery, [objectURL]);
      } finally {
        URL.revokeObjectURL(objectURL);
      }
    },
    onError: (_, { label }) => {
      toast.error(`Failed to create table ${label}. Please try again.`);
    },
  });

  const { addItem, reset, state } = useAsyncQueuer(
    async ({
      id,
      createQuery,
      label,
      file,
    }: {
      id: string;
      createQuery: string;
      label: string;
      file: File;
    }) => {
      await createTableAsync({
        createQuery,
        label,
        file,
      });

      setNodes([
        ...nodes,
        {
          id,
          position: { x: 0, y: 0 },
          type: "file",
          data: { label, file },
        } satisfies AppNode,
      ]);
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
      const createQuery = match(file.type)
        .with(
          MIME_TYPES.CSV,
          () => `SELECT * INTO ${tableName} FROM CSV(?, {autoExt: false})` // TODO: Handle CSV with BOM
        )
        .with(
          MIME_TYPES.XLS,
          () => `SELECT * INTO ${tableName} FROM XLS(?, {autoExt: false})`
        )
        .with(
          MIME_TYPES.XLSX,
          () => `SELECT * INTO ${tableName} FROM XLSX(?, {autoExt: false})`
        )
        .otherwise(() => `SELECT * INTO ${tableName} FROM ?`);

      addItem({
        id: tableName,
        label: tableName,
        createQuery,
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
