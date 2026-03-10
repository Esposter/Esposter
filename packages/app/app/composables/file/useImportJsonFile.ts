export const useImportJsonFile = () => {
  const importFile = useImportFile();
  return async (onSelect: (file: File) => Promise<void>): Promise<void> => {
    await importFile("application/json", ".json", onSelect);
  };
};
