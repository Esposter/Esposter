import type { DownloadFileUrl } from "#src/models/message/file/DownloadFileUrl";

export interface UploadFileUrl extends DownloadFileUrl {
  progress: number;
}
