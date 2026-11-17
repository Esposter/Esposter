// @vitest-environment nuxt
import { SpoilerExtension } from "#src/services/message/SpoilerExtension";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { describe, expect, test } from "vitest";

const pressShortcut = (editor: Editor, key: string) => {
  editor.view.dom.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ctrlKey: true, key, shiftKey: true }));
};

describe("spoilerExtension", () => {
  test.each([
    ["s", "spoiler", '<p><span data-spoiler="">a</span></p>'],
    ["x", "strikethrough", "<p><s>a</s></p>"],
  ])("ctrl+shift+%s toggles %s over the selection", (key, _mark, html) => {
    expect.hasAssertions();

    const editor = new Editor({ content: "<p>a</p>", extensions: [StarterKit, SpoilerExtension] });
    editor.commands.selectAll();
    pressShortcut(editor, key);
    const result = editor.getHTML();
    editor.destroy();

    expect(result).toBe(html);
  });
});
