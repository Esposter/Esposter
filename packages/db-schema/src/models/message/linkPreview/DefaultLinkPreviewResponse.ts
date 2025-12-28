import type { BaseLinkPreviewResponse } from "@/models/message/linkPreview/BaseLinkPreviewResponse";

export interface DefaultLinkPreviewResponse extends BaseLinkPreviewResponse {
  contentType?: string;
}
