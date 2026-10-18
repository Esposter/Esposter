import { PDF_MIME_TYPE } from "#src/services/constants";

// Saves a document's bytes under a file name, through an object URL released once the download has started
export const saveDocument = (filename: string, data: Uint8Array): void => {
  // The bytes may sit on a shared buffer, which a Blob does not take, so the download is a copy
  const url = URL.createObjectURL(new Blob([new Uint8Array(data)], { type: PDF_MIME_TYPE }));
  const anchor = window.document.createElement("a");
  anchor.download = filename;
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
};
