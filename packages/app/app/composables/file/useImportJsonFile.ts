import { lookup } from "mime-types";

export const useImportJsonFile = () => {
  const importFile = useImportFile();
  return async (onSelect: (file: File) => Promise<void>): Promise<void> => {
    await importFile(lookup(".json") || "", ".json", onSelect);
  };
};
