// @vitest-environment nuxt
import type { JSONContent } from "@tiptap/core";

import { deserializeNoteMarkdown } from "#shared/services/resource/note/deserializeNoteMarkdown";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { serializeNoteMarkdown } from "#shared/services/resource/note/serializeNoteMarkdown";
import { getSchema } from "@tiptap/core";
import { describe, expect, test } from "vitest";

const paragraph = (text: string): JSONContent => ({ content: [{ text, type: "text" }], type: "paragraph" });
const listItem = (...content: JSONContent[]): JSONContent => ({ content, type: "listItem" });
const taskItem = (checked: boolean, text: string): JSONContent => ({
  attrs: { checked },
  content: [paragraph(text)],
  type: "taskItem",
});

describe(deserializeNoteMarkdown, () => {
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
          { text: " Wow!", type: "text" },
          { marks: [{ attrs: { href: "https://example.com" }, type: "link" }], text: "here", type: "text" },
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

  test("a note with every block survives a Markdown round trip", () => {
    expect.hasAssertions();

    const noteSchema = getSchema(getNoteExtensions());
    const imported = deserializeNoteMarkdown(serializeNoteMarkdown(noteDoc));

    expect(noteSchema.nodeFromJSON(imported).toJSON()).toStrictEqual(noteSchema.nodeFromJSON(noteDoc).toJSON());
  });

  // A list mixing task and plain items is no task list, so its checkboxes are dropped and it reads as the list it is
  test("a list mixing task and plain items drops its checkboxes", () => {
    expect.hasAssertions();

    const noteSchema = getSchema(getNoteExtensions());
    const imported = deserializeNoteMarkdown("- [ ] a\n- b");

    expect(imported).toStrictEqual({
      content: [
        {
          content: [
            { content: [{ content: [{ marks: [], text: "a", type: "text" }], type: "paragraph" }], type: "listItem" },
            { content: [{ content: [{ marks: [], text: "b", type: "text" }], type: "paragraph" }], type: "listItem" },
          ],
          type: "bulletList",
        },
      ],
      type: "doc",
    });
    expect(() => {
      noteSchema.nodeFromJSON(imported).check();
    }).not.toThrow();
  });

  // A link to a scheme that can run a script is read as its text, so the note never holds a link the webpage refuses
  test("a link to a script scheme keeps its text without the link", () => {
    expect.hasAssertions();

    expect(deserializeNoteMarkdown("[click](javascript:alert(1))")).toStrictEqual({
      content: [{ content: [{ marks: [], text: "click", type: "text" }], type: "paragraph" }],
      type: "doc",
    });
  });
});

describe(serializeNoteMarkdown, () => {
  test("an image exports as its alt text", () => {
    expect.hasAssertions();

    expect(
      serializeNoteMarkdown({
        content: [{ attrs: { alt: "A cat", src: "/api/resource-assets/cat.png" }, type: "image" }],
        type: "doc",
      }),
    ).toBe("A cat\n");
  });

  // A mark's edge space sits outside its delimiters, and a heading's closing hash is escaped
  // A code span's edge space is padded, so each reads back as the text it holds
  test("edge characters of a mark, a heading and a code span are written so they read back", () => {
    expect.hasAssertions();

    expect(
      serializeNoteMarkdown({
        content: [
          { attrs: { level: 2 }, content: [{ text: "Item #", type: "text" }], type: "heading" },
          {
            content: [
              { marks: [{ type: "bold" }], text: "hello ", type: "text" },
              { marks: [{ type: "code" }], text: " x ", type: "text" },
            ],
            type: "paragraph",
          },
        ],
        type: "doc",
      }),
    ).toBe("## Item \\#\n\n**hello** `  x  `\n");
  });

  // A code span of only spaces is not padded, since a reader strips no space from a span of only spaces
  test("a code span of only spaces reads back as the spaces it holds", () => {
    expect.hasAssertions();

    const noteSchema = getSchema(getNoteExtensions());
    const doc: JSONContent = {
      content: [{ content: [{ marks: [{ type: "code" }], text: "  ", type: "text" }], type: "paragraph" }],
      type: "doc",
    };
    const imported = deserializeNoteMarkdown(serializeNoteMarkdown(doc));

    expect(noteSchema.nodeFromJSON(imported).toJSON()).toStrictEqual(noteSchema.nodeFromJSON(doc).toJSON());
  });

  // A line that CommonMark would read as a rule, a setext underline or an indented block is escaped, so it reads back
  test("a paragraph that starts like a block reads back as the text it holds", () => {
    expect.hasAssertions();

    const noteSchema = getSchema(getNoteExtensions());
    const doc: JSONContent = {
      content: [
        { content: [{ text: "---", type: "text" }], type: "paragraph" },
        { content: [{ text: "    indented", type: "text" }], type: "paragraph" },
        {
          content: [{ text: "foo", type: "text" }, { type: "hardBreak" }, { text: "===", type: "text" }],
          type: "paragraph",
        },
      ],
      type: "doc",
    };
    const imported = deserializeNoteMarkdown(serializeNoteMarkdown(doc));

    expect(noteSchema.nodeFromJSON(imported).toJSON()).toStrictEqual(noteSchema.nodeFromJSON(doc).toJSON());
  });
});
