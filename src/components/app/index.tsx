import { useCallback, useId, useMemo, useRef, useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Preview from "@/components/features/preview";
import { MIME_TYPES } from "@/const/mime-types";

function Page(): JSX.Element {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();

  const acceptedMimeTypes = useMemo(
    () => [MIME_TYPES.CSV, MIME_TYPES.XLS, MIME_TYPES.XLSX].join(", "),
    []
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (files !== null && files.length > 0) setFile(files[0]);
    },
    []
  );

  const onClearFile = useCallback(() => {
    if (inputRef.current !== null) inputRef.current.value = "";

    setFile(undefined);
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      {file !== undefined && (
        <div className="container mx-auto py-10 flex flex-col justify-center items-center gap-6">
          <Preview file={file} />
        </div>
      )}
      <div className="flex flex-col gap-3">
        <Label htmlFor={id}>Upload File</Label>
        <Input
          id={id}
          ref={inputRef}
          onChange={onInputChange}
          accept={acceptedMimeTypes}
          type="file"
          className="cursor-pointer disabled:cursor-not-allowed"
        />
        <Button
          className="cursor-pointer disabled:cursor-not-allowed"
          onClick={onClearFile}
        >
          Clear File
        </Button>
      </div>
    </div>
  );
}

export default Page;
