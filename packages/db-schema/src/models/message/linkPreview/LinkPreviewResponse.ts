import type { DefaultLinkPreviewResponse } from "#src/models/message/linkPreview/DefaultLinkPreviewResponse";
import type { URLLinkPreviewResponse } from "#src/models/message/linkPreview/URLLinkPreviewResponse";

export type LinkPreviewResponse = DefaultLinkPreviewResponse | URLLinkPreviewResponse;
