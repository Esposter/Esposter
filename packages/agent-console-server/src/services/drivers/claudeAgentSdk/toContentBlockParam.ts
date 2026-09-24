import type { Attachment } from "#src/models/command/Attachment";
import type { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

import { AttachmentMediaType } from "#src/models/command/AttachmentMediaType";
import { exhaustiveGuard } from "@esposter/shared";

type ContentBlockParam = Exclude<SDKUserMessage["message"]["content"], string>[number];
// An attached file as the content block the model reads it through: an image as itself, and a PDF or a text file as
// A document titled with the file's name
export const toContentBlockParam = ({ data, mediaType, name }: Attachment): ContentBlockParam => {
  switch (mediaType) {
    case AttachmentMediaType.Gif:
    case AttachmentMediaType.Jpeg:
    case AttachmentMediaType.Png:
    case AttachmentMediaType.Webp:
      return { source: { data, media_type: mediaType, type: "base64" }, type: "image" };
    case AttachmentMediaType.Pdf:
      return { source: { data, media_type: mediaType, type: "base64" }, title: name, type: "document" };
    case AttachmentMediaType.Text:
      return { source: { data, media_type: mediaType, type: "text" }, title: name, type: "document" };
    default:
      return exhaustiveGuard(mediaType);
  }
};
