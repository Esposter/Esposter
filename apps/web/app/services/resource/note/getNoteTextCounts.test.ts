// @vitest-environment happy-dom
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { getNoteTextCounts } from "#src/services/resource/note/getNoteTextCounts";
import { Editor } from "@tiptap/core";
import { describe, expect, test } from "vitest";

const createNoteEditor = (html: string) =>
  new Editor({ content: html, element: document.createElement("div"), extensions: getNoteExtensions() });

describe(getNoteTextCounts, () => {
  test("a language written without spaces counts by its words", () => {
    expect.hasAssertions();

    const { doc } = createNoteEditor("<p>私は学生です</p>").state;

    expect(getNoteTextCounts(doc, 0, doc.content.size)).toStrictEqual({ characters: 6, words: 4 });
  });

  test("a paragraph break separates two words", () => {
    expect.hasAssertions();

    const { doc } = createNoteEditor("<p>a</p><p>a</p>").state;

    expect(getNoteTextCounts(doc, 0, doc.content.size)).toStrictEqual({ characters: 3, words: 2 });
  });
});
