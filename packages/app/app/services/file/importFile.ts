import { takeOne } from "@esposter/shared";
import { showOpenFilePicker } from "show-open-file-picker";

export const importFile = async (mimeType: string, accept: string): Promise<File> => {
  const fileHandle = takeOne(
    await showOpenFilePicker({
      types: [
        {
          accept: { [mimeType]: accept.split(",").map((ext) => ext.trim()) },
          description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
        },
      ],
    }),
  );
  return fileHandle.getFile();
};
