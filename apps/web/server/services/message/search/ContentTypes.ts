import { getExtensionMimeTypeMap } from "@esposter/shared";

export const ContentTypes: ReadonlySet<string> = new Set(getExtensionMimeTypeMap().values());
