import type { DefaultLinkPreviewResponse } from "#shared/models/message/linkPreview/DefaultLinkPreviewResponse";
import type { URLLinkPreviewResponse } from "#shared/models/message/linkPreview/URLLinkPreviewResponse";

export type LinkPreviewResponse = DefaultLinkPreviewResponse | URLLinkPreviewResponse;
