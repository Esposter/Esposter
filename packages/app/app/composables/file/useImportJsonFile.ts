import { lookup } from "mime-types";

const jsonMimeType = lookup(".json") || "";

export const useImportJsonFile = () => {
  const importFile = useImportFile();
  return async (onSelect: (file: File) => Promise<void>): Promise<void> => {
    await importFile(jsonMimeType, ".json", onSelect);
  };
};
