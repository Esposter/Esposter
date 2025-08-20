import type { BaseLinkPreviewResponse } from "#shared/models/message/linkPreview/BaseLinkPreviewResponse";
import type { Video } from "#shared/models/message/linkPreview/Video";

export interface URLLinkPreviewResponse extends BaseLinkPreviewResponse {
  contentType: "text/html";
  description?: string;
  images: string[];
  siteName?: string;
  title: string;
  videos: Video[];
}
