import type { DownloadFileUrl } from "@/models/message/file/DownloadFileUrl";

export interface UploadFileUrl extends DownloadFileUrl {
  progress: number;
}
