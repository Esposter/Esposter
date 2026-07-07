import { downloadUrl } from "@/services/app/downloadUrl";

export const downloadFile = (filename: string, blobPart: BlobPart, type: string) => {
  const url = URL.createObjectURL(new Blob([blobPart], { type }));
  downloadUrl(url, filename);
  // Defer revocation so the anchor click has a chance to start the download first —
  // Revoking synchronously races WebKit and can silently abort the download.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  });
};
