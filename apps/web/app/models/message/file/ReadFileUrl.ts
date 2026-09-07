import type { DownloadFileUrl } from "@/models/message/file/DownloadFileUrl";

export interface ReadFileUrl extends DownloadFileUrl {
  // Epoch ms the signed urls stop working, so a cached entry can be re-minted before it dies on screen
  expiresAt: number;
}
