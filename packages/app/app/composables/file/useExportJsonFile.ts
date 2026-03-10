export const useExportJsonFile = () => {
  const exportFile = useExportFile();
  return async (fileName: string, data: unknown): Promise<void> => {
    const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    await exportFile((type) => Promise.resolve(new Blob([json], { type })), fileName, "application/json", ".json");
  };
};
