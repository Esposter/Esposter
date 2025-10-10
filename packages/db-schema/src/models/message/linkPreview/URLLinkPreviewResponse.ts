import type { BaseLinkPreviewResponse } from "@/models/message/linkPreview/BaseLinkPreviewResponse";
import type { Video } from "@/models/message/linkPreview/Video";

export interface URLLinkPreviewResponse extends BaseLinkPreviewResponse {
  contentType: "text/html";
  description?: string;
  images: string[];
  siteName?: string;
  title: string;
  videos: Video[];
}
