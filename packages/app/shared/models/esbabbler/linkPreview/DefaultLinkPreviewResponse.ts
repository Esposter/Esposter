import type { BaseLinkPreviewResponse } from "#shared/models/esbabbler/linkPreview/BaseLinkPreviewResponse";

export interface DefaultLinkPreviewResponse extends BaseLinkPreviewResponse {
  contentType?: string;
}
