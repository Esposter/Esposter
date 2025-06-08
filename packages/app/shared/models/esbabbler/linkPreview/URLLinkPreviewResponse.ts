import type { BaseLinkPreviewResponse } from "#shared/models/esbabbler/linkPreview/BaseLinkPreviewResponse";
import type { Video } from "#shared/models/esbabbler/linkPreview/Video";

export interface URLLinkPreviewResponse extends BaseLinkPreviewResponse {
  contentType: "text/html";
  description?: string;
  images: string[];
  siteName?: string;
  title: string;
  videos: Video[];
}
