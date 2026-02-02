import { takeOne } from "@esposter/shared";
import { showOpenFilePicker } from "show-open-file-picker";

export const uploadJsonFile = async (onSelect: (file: File) => Promise<void>) => {
  const fileSystemFileHandle = takeOne(
    await showOpenFilePicker({
      excludeAcceptAllOption: true,
      types: [{ accept: { "application/json": [".json"] }, description: "JSON" }],
    }),
  );
  const file = await fileSystemFileHandle.getFile();
  await onSelect(file);
};
