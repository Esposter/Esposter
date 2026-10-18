import type { JSONContent } from "@tiptap/core";
import type { MjmlRichTextDefinition } from "mjml-blocks";

import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { generateJSON } from "@tiptap/html";

// The Note's writing kit as an email's rich text: its HTML read into the Note's document and written back out
export const noteRichText: MjmlRichTextDefinition<JSONContent> = {
  parseHtml: (html) => generateJSON(html, getNoteExtensions()),
  renderHtml: renderNoteHtml,
  schema: noteDocumentSchema,
};
