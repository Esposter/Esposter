import type { BaseLinkPreviewResponse } from "#src/models/message/linkPreview/BaseLinkPreviewResponse";
import type { Video } from "#src/models/message/linkPreview/Video";

export interface URLLinkPreviewResponse extends BaseLinkPreviewResponse {
  contentType: "text/html";
  description?: string;
  images: string[];
  siteName?: string;
  title: string;
  videos: Video[];
}
