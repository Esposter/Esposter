// @vitest-environment nuxt
import RichTextEditor from "#src/components/RichTextEditor/Index.client.vue";
import { waitForEditorRender } from "#src/services/richTextEditor/waitForEditorRender.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("richTextEditor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("tears the editor down once on unmount", async () => {
    expect.hasAssertions();

    const destroy = vi.spyOn(Editor.prototype, "destroy");
    const component = await mountSuspended(RichTextEditor, { props: { limit: 100, modelValue: "" } });
    component.unmount();

    expect(destroy).toHaveBeenCalledExactlyOnceWith();
  });

  test("shows a placeholder set after mount", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(RichTextEditor, { props: { limit: 0, modelValue: "", placeholder: "a" } });
    await component.setProps({ placeholder: "b" });

    expect(component.find("[data-placeholder]").attributes("data-placeholder")).toBe("b");
  });

  test("rejects an insert past a limit set after mount", async () => {
    expect.hasAssertions();

    const setOptions = vi.spyOn(Editor.prototype, "setOptions");
    const component = await mountSuspended(RichTextEditor, { props: { limit: 0, modelValue: "a" } });
    await component.setProps({ limit: 1 });
    const editor = setOptions.mock.contexts.at(-1) as Editor;
    editor.view.dispatch(editor.state.tr.insertText("b"));

    expect(editor.getText()).toBe("a");
  });

  // Formatting acts on the selection, which exists only while the editor is focused
  test("enables the formatting buttons only while the editor is focused", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(RichTextEditor, {
      attachTo: document.body,
      props: { limit: 100, modelValue: "" },
    });
    const bold = component.get('[aria-label="Bold"]');
    const isRestDisabled = bold.attributes("disabled") !== undefined;
    component.get<HTMLElement>(".ProseMirror").element.focus();
    await waitForEditorRender();
    const isFocusedDisabled = bold.attributes("disabled") !== undefined;

    expect(isRestDisabled).toBe(true);
    expect(isFocusedDisabled).toBe(false);
  });
});
