import { MimeType } from "#shared/models/file/MimeType";

export const useImportJsonFile = () => {
  const importFile = useImportFile();
  return async (onSelect: (file: File) => Promise<void>): Promise<void> => {
    await importFile(MimeType.Json, ".json", onSelect);
  };
};
