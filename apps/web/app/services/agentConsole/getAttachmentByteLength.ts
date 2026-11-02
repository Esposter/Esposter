import type { Attachment } from "agent-console-server/contracts";

// The bytes an attachment takes on the wire: the JSON the page sends it in, with its base64 and any escapes counted
export const getAttachmentByteLength = (attachment: Attachment) =>
  new TextEncoder().encode(JSON.stringify(attachment)).byteLength;
