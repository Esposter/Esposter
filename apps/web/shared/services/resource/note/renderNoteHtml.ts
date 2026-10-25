import type { JSONContent } from "@tiptap/core";

import { NOTE_IMAGE_SOURCE_REGEX } from "#shared/services/resource/note/constants";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { sanitizeTextHtml } from "@esposter/shared";
import { generateHTML } from "@tiptap/html";

// The one image a published note may show: one held in resource storage, which is every image an upload returns. Any
// Other source is dropped with its element, so a tracking pixel or a hotlink never reaches a reader
const NOTE_IMAGE_ALLOWANCE = {
  allowedAttributes: { img: ["alt", "src", "title"] },
  allowedSources: { img: { src: [NOTE_IMAGE_SOURCE_REGEX] } },
  allowedTags: ["img"],
};

// A note's document as the HTML a reader sees, sanitised at the render boundary. Both the note view and the page
// Builder's text and email rich text render through it, so one writing kit and one sanitiser shape every read
export const renderNoteHtml = (content: JSONContent): string =>
  sanitizeTextHtml(generateHTML(content, getNoteExtensions()), NOTE_IMAGE_ALLOWANCE);
