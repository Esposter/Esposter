// @vitest-environment nuxt
import RichTextEditor from "@/components/RichTextEditor/Index.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/vue-3";
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
});
