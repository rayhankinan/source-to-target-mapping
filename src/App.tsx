import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { match } from "ts-pattern";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CSV_MIME_TYPE,
  XLS_MIME_TYPE,
  XLSX_MIME_TYPE,
} from "@/const/mime-types";

function App() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();

  const acceptedMimeTypes = useMemo(
    () => [CSV_MIME_TYPE, XLS_MIME_TYPE, XLSX_MIME_TYPE].join(", "),
    []
  );

  const objectURL = useMemo(
    () => (file !== undefined ? URL.createObjectURL(file) : undefined),
    [file]
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

  useEffect(
    () => () => {
      if (objectURL) URL.revokeObjectURL(objectURL);
    },
    [objectURL]
  );

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3">
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
      {file !== undefined && (
        <>
          {match(file !== undefined && file.type)
            .with(XLS_MIME_TYPE, () => <p>XLS File Selected</p>)
            .with(XLSX_MIME_TYPE, () => <p> XLSX File Selected</p>)
            .with(CSV_MIME_TYPE, () => <p> CSV File Selected</p>)
            .otherwise(() => (
              <Alert
                variant="destructive"
                className="w-full max-w-md border-destructive"
              >
                <AlertCircleIcon />
                <AlertTitle>Unsupported File Type</AlertTitle>
                <AlertDescription>
                  Please upload a file with one of the following MIME types:{" "}
                  {acceptedMimeTypes}.
                </AlertDescription>
              </Alert>
            ))}
        </>
      )}
    </div>
  );
}

export default App;
