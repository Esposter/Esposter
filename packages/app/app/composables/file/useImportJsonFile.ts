import { MimeType } from "#shared/models/file/MimeType";

export const useImportJsonFile = () => {
  const importFile = useImportFile();
  return (onSelect: (file: File) => Promise<void>): Promise<void> => importFile(MimeType.Json, ".json", onSelect);
};
