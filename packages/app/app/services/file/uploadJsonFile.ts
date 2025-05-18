import { showOpenFilePicker } from "show-open-file-picker";

export const uploadJsonFile = async (onSelect: (file: File) => Promise<void>) => {
  const fileSystemFileHandle = (
    await showOpenFilePicker({
      excludeAcceptAllOption: true,
      types: [{ accept: { "application/json": [".json"] }, description: "JSON" }],
    })
  )[0];
  const file = await fileSystemFileHandle.getFile();
  await onSelect(file);
};
