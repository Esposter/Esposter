import type { DownloadFileUrl } from "@/models/esbabbler/file/DownloadFileUrl";

export interface UploadFileUrl extends DownloadFileUrl {
  progress: number;
}
