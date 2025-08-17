import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { Panel } from "@xyflow/react";
import { Upload, Merge, X } from "lucide-react";
import { uniqueId } from "lodash";
import log from "loglevel";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProgressDialog from "@/components/features/diagram/progress-dialog";
import { MIME_TYPES } from "@/const/mime-types";
import { JOIN_NODE_TYPE, UNION_NODE_TYPE } from "@/types/flow";
import useInitializeDatabase from "@/hooks/useInitializeDatabase";
import useFlowStore from "@/stores/flow";

export default function AppPanel(): JSX.Element {
  const [fileList, setFileList] = useState<File[]>([]);

  const { addNode } = useFlowStore(
    useShallow((state) => ({
      addNode: state.addNode,
    }))
  );

  const { mutate: initializeDatabase, status: initializeStatus } =
    useInitializeDatabase();

  const isDisabled = useMemo(
    () => initializeStatus !== "success",
    [initializeStatus]
  );

  const onUploadFileButtonClick = useCallback(async () => {
    try {
      const fileHandles = await window.showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: "Spreadsheet files",
            accept: {
              [MIME_TYPES.CSV]: [".csv"],
              [MIME_TYPES.XLSX]: [".xlsx"],
            },
          },
        ],
      });

      const files = await Promise.all(
        fileHandles.map(async (fileHandle) => await fileHandle.getFile())
      );

      setFileList(files);
    } catch (error) {
      if (!(error instanceof Error) || error.name !== "AbortError") throw error;

      log.warn(error);
    }
  }, []);

  const onCombineTablesButtonClick = useCallback(async () => {
    const label = uniqueId("tbl_join_");

    addNode({
      id: label,
      position: { x: 0, y: 0 },
      type: JOIN_NODE_TYPE,
      data: {
        label,
      },
    });
  }, [addNode]);

  const onStackTablesButtonClick = useCallback(async () => {
    const label = uniqueId("tbl_union_");

    addNode({
      id: label,
      position: { x: 0, y: 0 },
      type: UNION_NODE_TYPE,
      data: {
        label,
      },
    });
  }, [addNode]);

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  return (
    <>
      <Panel position="top-left" className="flex flex-row gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onUploadFileButtonClick}
                disabled={isDisabled}
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
                disabled={isDisabled}
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
                disabled={isDisabled}
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
