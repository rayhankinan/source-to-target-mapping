import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

function App() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();

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
          className="cursor-pointer disabled:cursor-not-allowed"
          type="file"
          accept="text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
        <Button
          className="cursor-pointer disabled:cursor-not-allowed"
          onClick={onClearFile}
        >
          Clear File
        </Button>
      </div>
      <p>Object URL: {objectURL}</p>
    </div>
  );
}

export default App;
