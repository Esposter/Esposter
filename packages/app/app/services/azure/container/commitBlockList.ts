import { MimeType } from "#shared/models/file/MimeType";
import dedent from "dedent";

// Put Block List is the only call in the upload that sets the blob's own headers — Put Block ignores them — so
// The file's type has to be stamped here or the blob keeps whatever Azure defaults to. The two content types
// Are different things and both are load-bearing: `Content-Type` describes this request's XML body, while
// `x-ms-blob-content-type` describes the bytes the blocks just committed. Sending the body's type as the
// Blob's would store every upload as XML, so an omitted `contentType` sends no blob header at all rather
// Than falling back to one that is certainly wrong.
export const commitBlockList = (sasUrl: string, blockIds: string[], contentType?: string) =>
  fetch(`${sasUrl}&comp=blocklist`, {
    body: dedent`
    <BlockList>
      ${blockIds.map((blockId) => `<Latest>${blockId}</Latest>`).join("\n")}
    </BlockList>
  `,
    headers: {
      "Content-Type": MimeType.Xml,
      ...(contentType && { "x-ms-blob-content-type": contentType }),
    },
    method: "PUT",
  });
