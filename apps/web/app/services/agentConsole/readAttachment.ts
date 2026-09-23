import type { Attachment } from "agent-console-server/contracts";

import { getResult } from "@esposter/shared";
import { AttachmentMediaType, attachmentMediaTypeSchema } from "agent-console-server/contracts";
// A pasted or dropped file as an attachment the model reads: an image or a PDF by its type, and any other file whose
// Bytes are text as that text, whatever the browser calls its type. A file that is neither is binary the model cannot
// Read, and is left out
export const readAttachment = async (file: File): Promise<Attachment | undefined> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mediaType = attachmentMediaTypeSchema.safeParse(file.type);
  if (mediaType.success && mediaType.data !== AttachmentMediaType.Text)
    return { data: bytes.toBase64(), mediaType: mediaType.data, name: file.name };
  return getResult(() => new TextDecoder(undefined, { fatal: true }).decode(bytes)).match(
    (text) => ({ data: text, mediaType: AttachmentMediaType.Text, name: file.name }),
    () => undefined,
  );
};
