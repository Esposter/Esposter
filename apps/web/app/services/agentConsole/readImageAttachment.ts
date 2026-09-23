import type { ImageAttachment } from "agent-console-server/contracts";

import { imageMediaTypeSchema } from "agent-console-server/contracts";
// A pasted or dropped file as an image block the prompt carries, or nothing for a file that is not an image the
// Model reads
export const readImageAttachment = async (file: File): Promise<ImageAttachment | undefined> => {
  const mediaType = imageMediaTypeSchema.safeParse(file.type);
  if (!mediaType.success) return undefined;
  const bytes = new Uint8Array(await file.arrayBuffer());
  return { data: bytes.toBase64(), mediaType: mediaType.data };
};
