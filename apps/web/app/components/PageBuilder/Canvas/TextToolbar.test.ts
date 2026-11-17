// @vitest-environment nuxt
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import PageBuilderCanvasTextToolbar from "#src/components/PageBuilder/Canvas/TextToolbar.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/core";
import { describe, expect, onTestFinished, test } from "vitest";

// The buttons that act on a selection are enabled only while the editor is focused, so the editor's element is in the document
const createFocusedEditor = (content: string, selection: number | { from: number; to: number }) => {
  const element = window.document.createElement("div");
  window.document.body.append(element);
  const editor = new Editor({ content, element, extensions: getNoteExtensions() });
  onTestFinished(() => {
    editor.destroy();
    element.remove();
  });
  editor.commands.setTextSelection(selection);
  editor.view.dom.focus();
  return editor;
};

describe("pageBuilderCanvasTextToolbar", () => {
  test("the bold control bolds the selected words", async () => {
    expect.hasAssertions();

    const editor = createFocusedEditor("<p>one two</p>", { from: 1, to: 4 });
    const component = await mountSuspended(PageBuilderCanvasTextToolbar, {
      props: { editor, position: { left: 0, top: 0 } },
    });

    await component.get("button[aria-label='Bold']").trigger("click");

    expect(editor.getHTML()).toBe("<p><strong>one</strong> two</p>");
  });

  test("the link control links the selected words", async () => {
    expect.hasAssertions();

    const editor = createFocusedEditor("<p>one two</p>", { from: 1, to: 4 });
    const component = await mountSuspended(PageBuilderCanvasTextToolbar, {
      props: { editor, position: { left: 0, top: 0 } },
    });

    await component.get("button[aria-label='Link']").trigger("click");
    await component.get("input").setValue("https://example.com");
    await component.get("form").trigger("submit");

    expect(editor.getHTML()).toBe(
      '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">one</a> two</p>',
    );
  });

  test("clearing the link address removes the link", async () => {
    expect.hasAssertions();

    const editor = createFocusedEditor('<p><a href="https://example.com">one</a> two</p>', 2);
    const component = await mountSuspended(PageBuilderCanvasTextToolbar, {
      props: { editor, position: { left: 0, top: 0 } },
    });

    await component.get("button[aria-label='Link']").trigger("click");
    // The field opens on the address the words already link to, so clearing it is an edit of that link
    expect(component.get<HTMLInputElement>("input").element.value).toBe("https://example.com");
    await component.get("input").setValue("");
    await component.get("form").trigger("submit");

    expect(editor.getHTML()).toBe("<p>one two</p>");
  });
});
