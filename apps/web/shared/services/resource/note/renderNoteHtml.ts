import type { JSONContent } from "@tiptap/core";

import { NOTE_IMAGE_SOURCE_REGEX } from "#shared/services/resource/note/constants";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { sanitizeTextHtml } from "@esposter/shared";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";

// The one image a published note may show: one held in resource storage, which is every image an upload returns. Any
// Other source is dropped with its element, so a tracking pixel or a hotlink never reaches a reader
const NOTE_IMAGE_ALLOWANCE = {
  allowedAttributes: { img: ["alt", "src", "title"] },
  allowedSources: { img: { src: [NOTE_IMAGE_SOURCE_REGEX] } },
  allowedTags: ["img"],
};

// A note's document as the HTML a reader sees, sanitised at the render boundary. Both the note view and the page
// Builder's text and email rich text render through it, so one writing kit and one sanitiser shape every read. It renders
// From the schema's own output specs with no DOM: `@tiptap/html`'s `generateHTML` throws wherever `window` is absent,
// Which in the web Worker is every server-side publish and export
export const renderNoteHtml = (content: JSONContent): string =>
  sanitizeTextHtml(renderToHTMLString({ content, extensions: getNoteExtensions() }), NOTE_IMAGE_ALLOWANCE);
