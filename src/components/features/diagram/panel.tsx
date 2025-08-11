import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { Panel } from "@xyflow/react";
import { Upload, Merge, X } from "lucide-react";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProgressDialog from "@/components/features/diagram/progress-dialog";
import useInitializeDatabase from "@/hooks/useInitializeDatabase";
import useCreateTableNode from "@/hooks/useCreateTableNode";
import { MIME_TYPES } from "@/const/mime-types";
import { JOIN_NODE_TYPE, UNION_NODE_TYPE } from "@/types/flow";

export default function AppPanel(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = useState<File[]>([]);

  const acceptedMimeTypes = useMemo(
    () => [MIME_TYPES.CSV, MIME_TYPES.XLS, MIME_TYPES.XLSX].join(", "),
    []
  );

  const { mutate: initializeDatabase, status: initializeStatus } =
    useInitializeDatabase();

  const { mutateAsync: createTableNodeAsync } = useCreateTableNode();

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      setFileList(files !== null ? Array.from(files) : []);

      e.target.value = ""; // Reset input value to allow re-uploading the same file
    },
    []
  );

  const onUploadFileButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onCombineTablesButtonClick = useCallback(async () => {
    const tableName = _.uniqueId("tbl_join_");

    await createTableNodeAsync({
      label: tableName,
      type: JOIN_NODE_TYPE,
    });
  }, [createTableNodeAsync]);

  const onStackTablesButtonClick = useCallback(async () => {
    const tableName = _.uniqueId("tbl_union_");

    await createTableNodeAsync({
      label: tableName,
      type: UNION_NODE_TYPE,
    });
  }, [createTableNodeAsync]);

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onUploadFileButtonClick}
                disabled={initializeStatus !== "success"}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <Upload />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload files</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onCombineTablesButtonClick}
                disabled={initializeStatus !== "success"}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Combine Tables</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onStackTablesButtonClick}
                disabled={initializeStatus !== "success"}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <Merge />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stack Tables</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Panel>
      <ProgressDialog
        fileList={fileList}
        resetFileList={() => setFileList([])}
      />
    </>
  );
}
