import { lookup } from "mime-types";

export const useExportJsonFile = () => {
  const exportFile = useExportFile();
  return async (fileName: string, data: string | unknown): Promise<void> => {
    const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    const mimeType = lookup(".json") || "";
    await exportFile(() => Promise.resolve(new Blob([json], { type: mimeType })), fileName, mimeType, ".json");
  };
};
