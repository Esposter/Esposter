// Hands the file to the browser's download, since there is no dialog to ask where it goes
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  window.document.body.append(link);
  link.click();
  link.remove();
  // Revoked after the click has been handed to the browser, since revoking it at once can cancel the download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};
// The File System Access save picker where the browser has it. Where it does not, the written file is downloaded
// Once its writable closes, and an aborted writable downloads nothing
export const showSaveFilePicker = (options?: SaveFilePickerOptions): Promise<SaveFilePickerHandle> => {
  if (window.showSaveFilePicker) return window.showSaveFilePicker(options);

  return Promise.resolve({
    createWritable: () => {
      let blob = new Blob();
      return Promise.resolve({
        abort: () => Promise.resolve(),
        close: () => {
          downloadBlob(blob, options?.suggestedName ?? "");
          return Promise.resolve();
        },
        write: (data) => {
          blob = new Blob([blob, data], { type: data.type });
          return Promise.resolve();
        },
      });
    },
  });
};
