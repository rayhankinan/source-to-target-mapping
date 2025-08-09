import { useCallback, useMemo, useRef, type JSX } from "react";
import { Panel } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MIME_TYPES } from "@/const/mime-types";
import useFlowStore from "@/stores/flow";
import type { AppNode } from "@/types/flow";
import { sanitizeTableName } from "@/utils/sanitize";

export default function AppPanel(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedMimeTypes = useMemo(
    () => [MIME_TYPES.CSV, MIME_TYPES.XLS, MIME_TYPES.XLSX].join(", "),
    []
  );

  const { nodes, setNodes } = useFlowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    }))
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (files !== null && files.length > 0)
        setNodes([
          ...nodes,
          ...Array.from(files).map(
            (file) =>
              ({
                id: _.uniqueId("node_"),
                position: { x: 0, y: 0 },
                data: { label: sanitizeTableName(file.name), file },
              } satisfies AppNode)
          ),
        ]);
    },
    [nodes, setNodes]
  );

  const onButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
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
        className="cursor-pointer disabled:cursor-not-allowed"
      >
        Upload Files
      </Button>
    </Panel>
  );
}
