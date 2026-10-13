import type { FileContentMessage } from "agent-console-server/contracts";

// The session's files as the host last listed them, and the file the view has open. Both are the host's answers, so a
// Reconnect that asks again replaces them rather than merging
export const useAgentConsoleFileStore = defineStore("agentConsole/file", () => {
  const files = ref<string[]>([]);
  const openedFile = shallowRef<FileContentMessage>();

  const storeFiles = (newFiles: string[]) => {
    files.value = newFiles;
  };
  const storeOpenedFile = (fileContent: FileContentMessage) => {
    openedFile.value = fileContent;
  };
  const closeFile = () => {
    openedFile.value = undefined;
  };

  return { closeFile, files, openedFile, storeFiles, storeOpenedFile };
});
