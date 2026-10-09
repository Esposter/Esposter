// @vitest-environment nuxt
import { getNoteExtensions } from "@/services/resource/note/getNoteExtensions";
import { NoteSlashSuggestion } from "@/services/resource/note/NoteSlashSuggestion";
import { Editor } from "@tiptap/vue-3";
import { assert, describe, expect, test } from "vitest";

describe("noteSlashSuggestion", () => {
  test("finds a block by the short word a reader types", async () => {
    expect.hasAssertions();

    assert.exists(NoteSlashSuggestion.items);
    const editor = new Editor({ extensions: getNoteExtensions() });
    const items = await NoteSlashSuggestion.items({ editor, query: "h1", signal: new AbortController().signal });
    editor.destroy();

    expect(items.map(({ title }) => title)).toStrictEqual(["Heading 1"]);
  });
});
