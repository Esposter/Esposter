import type { DefaultLinkPreviewResponse } from "@/models/message/linkPreview/DefaultLinkPreviewResponse";
import type { URLLinkPreviewResponse } from "@/models/message/linkPreview/URLLinkPreviewResponse";

export type LinkPreviewResponse = DefaultLinkPreviewResponse | URLLinkPreviewResponse;
