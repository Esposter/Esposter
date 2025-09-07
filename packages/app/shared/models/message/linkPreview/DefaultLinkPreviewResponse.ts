import type { BaseLinkPreviewResponse } from "#shared/models/message/linkPreview/BaseLinkPreviewResponse";

export interface DefaultLinkPreviewResponse extends BaseLinkPreviewResponse {
  contentType?: string;
}
