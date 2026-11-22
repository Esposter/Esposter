import type { JSONContent } from "@tiptap/core";
import type { Mark, Node } from "@tiptap/pm/model";

import { NOTE_IMAGE_SOURCE_REGEX } from "#shared/services/resource/note/constants";
import { noteExtensions, noteProseMirrorSchema } from "#shared/services/resource/note/noteProseMirrorSchema";
import { sanitizeTextHtml } from "@esposter/shared";
import { getAttributesFromExtensions, resolveExtensions, splitExtensions } from "@tiptap/core";
import { escapeHTML, renderJSONContentToString } from "@tiptap/static-renderer/json/html-string";
import {
  domOutputSpecToHTMLString,
  mapMarkExtensionToReactNode,
  mapNodeExtensionToReactNode,
  serializeChildrenToHTMLString,
} from "@tiptap/static-renderer/pm/html-string";

// The one image a published note may show: one held in resource storage, which is every image an upload returns. Any
// Other source is dropped with its element, so a tracking pixel or a hotlink never reaches a reader
const NOTE_IMAGE_ALLOWANCE = {
  allowedAttributes: { img: ["alt", "src", "title"] },
  allowedSources: { img: { src: [NOTE_IMAGE_SOURCE_REGEX] } },
  allowedTags: ["img"],
};
const resolvedNoteExtensions = resolveExtensions(noteExtensions);
const noteExtensionAttributes = getAttributesFromExtensions(resolvedNoteExtensions);
const { markExtensions, nodeExtensions } = splitExtensions(resolvedNoteExtensions);
// The writing kit's renderer, assembled once from the pieces `renderToHTMLString` assembles on every call: resolving
// The extensions and mapping each one's output spec to a string was most of what rendering one note cost
const renderNoteNode = renderJSONContentToString<Mark, Node>({
  markMapping: Object.fromEntries(
    markExtensions.map((extension) =>
      mapMarkExtensionToReactNode(domOutputSpecToHTMLString, extension, noteExtensionAttributes),
    ),
  ),
  nodeMapping: {
    ...Object.fromEntries(
      nodeExtensions.map((extension) =>
        mapNodeExtensionToReactNode(domOutputSpecToHTMLString, extension, noteExtensionAttributes),
      ),
    ),
    doc: ({ children }) => serializeChildrenToHTMLString(children),
    text: ({ node }) => escapeHTML(node.text ?? ""),
  },
});

// A note's document as the HTML a reader sees, sanitised at the render boundary. Both the note view and the page
// Builder's text and email rich text render through it, so one writing kit and one sanitiser shape every read. It renders
// From the schema's own output specs with no DOM: `@tiptap/html`'s `generateHTML` throws wherever `window` is absent,
// Which in the web Worker is every server-side publish and export
export const renderNoteHtml = (content: JSONContent): string =>
  sanitizeTextHtml(renderNoteNode({ content: noteProseMirrorSchema.nodeFromJSON(content) }), NOTE_IMAGE_ALLOWANCE);
