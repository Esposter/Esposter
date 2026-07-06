import { downloadUrl } from "@/services/app/downloadUrl";

export const downloadFile = (filename: string, blobPart: BlobPart, type: string) => {
  const url = URL.createObjectURL(new Blob([blobPart], { type }));
  downloadUrl(url, filename);
  URL.revokeObjectURL(url);
};
