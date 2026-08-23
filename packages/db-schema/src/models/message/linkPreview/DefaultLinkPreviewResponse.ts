import type { BaseLinkPreviewResponse } from "#src/models/message/linkPreview/BaseLinkPreviewResponse";

export interface DefaultLinkPreviewResponse extends BaseLinkPreviewResponse {
  contentType?: string;
}
