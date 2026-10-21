import { MimeType } from "#shared/models/file/MimeType";
import type { BlockUploadOptions } from "@/models/azure/container/BlockUploadOptions";

import { BLOB_CONTENT_TYPE_HEADER } from "@/services/azure/container/constants";
import { requestBlobStorage } from "@/services/azure/container/requestBlobStorage";
import { dedent } from "@esposter/shared";

// Put Block List is the only call in the upload that sets the blob's own headers — Put Block ignores them — so
// The file's type has to be stamped here or the blob keeps whatever Azure defaults to. The two content types
// Are different things and both are load-bearing: `Content-Type` describes this request's XML body, while
// `x-ms-blob-content-type` describes the bytes the blocks just committed. Sending the body's type as the
// Blob's would store every upload as XML, so an omitted `contentType` sends no blob header at all rather
// Than falling back to one that is certainly wrong.
// A create-only commit carries If-None-Match: *, so Blob Storage answers 412 rather than replace an existing blob
export const commitBlockList = (
  sasUrl: string,
  blockIds: string[],
  contentType?: string,
  { isCreateOnly }: BlockUploadOptions = {},
) =>
  requestBlobStorage(`${sasUrl}&comp=blocklist`, {
    body: dedent`
    <BlockList>
      ${blockIds.map((blockId) => `<Latest>${blockId}</Latest>`).join("\n")}
    </BlockList>
  `,
    headers: {
      "Content-Type": MimeType.Xml,
      ...(contentType && { [BLOB_CONTENT_TYPE_HEADER]: contentType }),
      ...(isCreateOnly && { "If-None-Match": "*" }),
    },
    method: "PUT",
  });
