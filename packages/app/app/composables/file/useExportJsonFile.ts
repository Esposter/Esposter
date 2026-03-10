import { lookup } from "mime-types";

const jsonMimeType = lookup(".json") || "";

export const useExportJsonFile = () => {
  const exportFile = useExportFile();
  return async (fileName: string, data: string | unknown): Promise<void> => {
    const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    await exportFile(() => Promise.resolve(new Blob([json], { type: jsonMimeType })), fileName, jsonMimeType, ".json");
  };
};
