import { MimeType } from "#shared/models/file/MimeType";

export const useExportJsonFile = () => {
  const exportFile = useExportFile();
  return async (filename: string, data: unknown) => {
    const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    await exportFile((type) => Promise.resolve(new Blob([json], { type })), filename, MimeType.Json, ".json");
  };
};
