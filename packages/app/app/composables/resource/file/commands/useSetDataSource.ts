import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { useFileStore } from "@/store/resource/file";
import { useFileHistoryStore } from "@/store/resource/file/history";
// Imports replace the whole data section wholesale, so the command history no longer applies
export const useSetDataSource = () => {
  const fileStore = useFileStore();
  const { saveFile } = fileStore;
  const fileHistoryStore = useFileHistoryStore();
  const { clear } = fileHistoryStore;
  return async (value: DataSource) => {
    fileStore.fileResource.data = value;
    clear();
    await saveFile();
  };
};
