// @vitest-environment nuxt
import type { JSONContent } from "@tiptap/core";

import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { deserializeNoteMarkdown } from "@/services/resource/note/deserializeNoteMarkdown";
import { serializeNoteMarkdown } from "@/services/resource/note/serializeNoteMarkdown";
import { getSchema } from "@tiptap/core";
import { describe, expect, test } from "vitest";

describe(deserializeNoteMarkdown, () => {
  const paragraph = (text: string): JSONContent => ({ content: [{ text, type: "text" }], type: "paragraph" });
  const listItem = (...content: JSONContent[]): JSONContent => ({ content, type: "listItem" });
  const taskItem = (checked: boolean, text: string): JSONContent => ({
    attrs: { checked },
    content: [paragraph(text)],
    type: "taskItem",
  });
  // Every block the writing kit holds that CommonMark carries, with the marks and characters a reader can type
  const noteDoc: JSONContent = {
    content: [
      { attrs: { level: 1 }, content: [{ text: "Meeting", type: "text" }], type: "heading" },
      {
        content: [
          { text: "plain ", type: "text" },
          { marks: [{ type: "bold" }], text: "bold", type: "text" },
          { text: " and ", type: "text" },
          { marks: [{ type: "italic" }], text: "italic", type: "text" },
          { text: " ", type: "text" },
          { marks: [{ attrs: { href: "https://example.com" }, type: "link" }], text: "link", type: "text" },
          { text: " *_[]~<>&\\`", type: "text" },
          { type: "hardBreak" },
          { text: "next", type: "text" },
        ],
        type: "paragraph",
      },
      {
        content: [
          listItem(paragraph("one")),
          listItem(paragraph("two"), { content: [listItem(paragraph("three"))], type: "bulletList" }),
        ],
        type: "bulletList",
      },
      { attrs: { start: 1 }, content: [listItem(paragraph("first"))], type: "orderedList" },
      { content: [taskItem(true, "done"), taskItem(false, "todo")], type: "taskList" },
      { content: [paragraph("quoted")], type: "blockquote" },
      { attrs: { language: "ts" }, content: [{ text: "const a = 1;", type: "text" }], type: "codeBlock" },
      { type: "horizontalRule" },
    ],
    type: "doc",
  };

  test("A note with every block survives a Markdown round trip", () => {
    expect.hasAssertions();

    const noteSchema = getSchema(getNoteExtensions());
    const imported = deserializeNoteMarkdown(serializeNoteMarkdown(noteDoc));

    expect(noteSchema.nodeFromJSON(imported).toJSON()).toStrictEqual(noteSchema.nodeFromJSON(noteDoc).toJSON());
  });
});
