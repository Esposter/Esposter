import type { Video } from "#shared/models/esbabbler/linkPreview/Video";

export interface URLLinkPreviewResponse {
  contentType: "text/html";
  description?: string;
  favicons: string[];
  images: string[];
  mediaType: string;
  siteName?: string;
  title: string;
  url: string;
  videos: Video[];
}
