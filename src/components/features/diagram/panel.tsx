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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgressDialog from "@/components/features/diagram/progress-dialog";
import { MIME_TYPES } from "@/const/mime-types";

export default function AppPanel(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = useState<FileList | null>(null);

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

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      setFileList(files);
    },
    []
  );

  const onButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  return (
    <>
      <Panel position="top-left">
        <Input
          ref={inputRef}
          onChange={onInputChange}
          accept={acceptedMimeTypes}
          type="file"
          className="hidden"
          multiple
        />
        <Button
          onClick={onButtonClick}
          disabled={initializeStatus !== "success"}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          Upload Files
        </Button>
      </Panel>
      <ProgressDialog
        fileList={fileList}
        resetFileList={() => setFileList(null)}
      />
    </>
  );
}
