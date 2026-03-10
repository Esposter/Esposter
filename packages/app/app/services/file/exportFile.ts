import { showSaveFilePicker } from "show-open-file-picker";

export const exportFile = async (blob: Blob, fileName: string, mimeType: string, accept: string): Promise<void> => {
  const fileHandle = await showSaveFilePicker({
    suggestedName: fileName,
    types: [
      {
        accept: { [mimeType]: accept.split(",").map((ext) => ext.trim()) },
        description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
      },
    ],
  });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(blob);
    await writable.close();
  } catch (error) {
    await writable.abort();
    throw error;
  }
};
