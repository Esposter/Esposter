import type { DefaultLinkPreviewResponse } from "#shared/models/esbabbler/linkPreview/DefaultLinkPreviewResponse";
import type { URLLinkPreviewResponse } from "#shared/models/esbabbler/linkPreview/URLLinkPreviewResponse";

export type LinkPreviewResponse = DefaultLinkPreviewResponse | URLLinkPreviewResponse;
