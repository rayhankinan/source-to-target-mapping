import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { useMutation } from "@tanstack/react-query";
import alasql from "alasql";
import { toast } from "sonner";
import { Panel } from "@xyflow/react";
import { Upload, Merge } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgressDialog from "@/components/features/diagram/progress-dialog";
import { MIME_TYPES } from "@/const/mime-types";
import useFlowStore from "@/stores/flow";
import { UNION_NODE_TYPE, type UnionNodeType } from "@/types/flow";

export default function AppPanel(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = useState<File[]>([]);

  const { addNode } = useFlowStore(
    useShallow((state) => ({
      addNode: state.addNode,
    }))
  );

  const acceptedMimeTypes = useMemo(
    () => [MIME_TYPES.CSV, MIME_TYPES.XLS, MIME_TYPES.XLSX].join(", "),
    []
  );

  const { mutate: initializeDatabase, status: initializeStatus } = useMutation({
    mutationFn: async () => {
      await alasql.promise("DROP INDEXEDDB DATABASE IF EXISTS fusion");
      await alasql.promise("CREATE INDEXEDDB DATABASE IF NOT EXISTS fusion");
      await alasql.promise("ATTACH INDEXEDDB DATABASE fusion");
      await alasql.promise("USE fusion");
    },
    onError: () => {
      toast.error("Failed to initialize database. Please try again.");
    },
  });

  const { mutateAsync: createNodeAsync } = useMutation({
    mutationFn: async ({ label }: { label: string; type: UnionNodeType }) => {
      await alasql.promise(`DROP TABLE IF EXISTS ${label}`);
      await alasql.promise(`CREATE TABLE IF NOT EXISTS ${label}`);
    },
    onSuccess: (_, { label, type }) => {
      addNode({
        id: label,
        position: { x: 0, y: 0 },
        type,
        data: {
          label,
        },
      });
    },
    onError: (_, { label }) => {
      toast.error(`Failed to create table ${label}. Please try again.`);
    },
  });

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      setFileList(files ? Array.from(files) : []);

      e.target.value = ""; // Reset input value to allow re-uploading the same file
    },
    []
  );

  const onUploadFileButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onMergeFilesButtonClick = useCallback(async () => {
    const tableName = _.uniqueId("tbl_union_");

    await createNodeAsync({
      label: tableName,
      type: UNION_NODE_TYPE,
    });
  }, [createNodeAsync]);

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  return (
    <>
      <Panel position="top-left" className="flex flex-row gap-2">
        <Input
          ref={inputRef}
          onChange={onInputChange}
          accept={acceptedMimeTypes}
          type="file"
          className="hidden"
          multiple
        />
        <Button
          onClick={onUploadFileButtonClick}
          disabled={initializeStatus !== "success"}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          <Upload />
        </Button>
        <Button
          onClick={onMergeFilesButtonClick}
          disabled={initializeStatus !== "success"}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          <Merge />
        </Button>
      </Panel>
      <ProgressDialog
        fileList={fileList}
        resetFileList={() => setFileList([])}
      />
    </>
  );
}
