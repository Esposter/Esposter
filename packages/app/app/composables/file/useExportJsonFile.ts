export const useExportJsonFile = () => {
  const exportFile = useExportFile();
  return async (fileName: string, data: string | unknown): Promise<void> => {
    const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    await exportFile(async () => new Blob([json], { type: "application/json" }), fileName, "application/json", ".json");
  };
};
