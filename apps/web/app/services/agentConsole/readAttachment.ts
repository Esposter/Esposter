import type { Attachment } from "agent-console-server/contracts";

import { getResult } from "@esposter/shared";
import { AttachmentMediaType, attachmentMediaTypeSchema } from "agent-console-server/contracts";

// A pasted or dropped file as an attachment the model reads: an image or a PDF by its type, and any other file whose
// Bytes are text as that text, whatever the browser calls its type — UTF-16 by its byte order mark, UTF-8 otherwise. A
// File that is neither is binary the model cannot read, and is left out
export const readAttachment = async (file: File): Promise<Attachment | undefined> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mediaType = attachmentMediaTypeSchema.safeParse(file.type);
  if (mediaType.success && mediaType.data !== AttachmentMediaType.Text)
    return { data: bytes.toBase64(), mediaType: mediaType.data, name: file.name };
  const encoding =
    bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" : bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf8";
  return getResult(() => new TextDecoder(encoding, { fatal: true }).decode(bytes)).match(
    (text) => ({ data: text, mediaType: AttachmentMediaType.Text, name: file.name }),
    () => undefined,
  );
};
