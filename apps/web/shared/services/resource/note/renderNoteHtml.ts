import type { JSONContent } from "@tiptap/core";

import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { sanitizeTextHtml } from "@esposter/shared";
import { generateHTML } from "@tiptap/html";

// A note's document as the HTML a reader sees, sanitised at the render boundary. Both the note view and the page
// Builder's text and email rich text render through it, so one writing kit and one sanitiser shape every read
export const renderNoteHtml = (content: JSONContent): string =>
  sanitizeTextHtml(generateHTML(content, getNoteExtensions()));
