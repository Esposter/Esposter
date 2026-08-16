import type { MimeType } from "#shared/models/file/MimeType";

import { normalizeString } from "@esposter/shared";

// The file picker takes the extensions the caller accepts, plus a description it shows as the filter's label —
// Which is the first extension without its dot, the way a native save dialog names a format
export const getFilePickerTypes = (mimeType: MimeType, accept: string) => {
  const extensions = accept.split(",").map((extension) => normalizeString(extension));
  return [
    {
      accept: { [mimeType]: extensions },
      description: (extensions[0] ?? "").replace(/^\./u, "").toUpperCase(),
    },
  ];
};
