// @vitest-environment nuxt
import RichTextEditor from "@/components/RichTextEditor/Index.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/vue-3";
import { describe, expect, test, vi } from "vitest";

describe("richTextEditor", () => {
  test("tears the editor down once on unmount", async () => {
    expect.hasAssertions();

    const destroy = vi.spyOn(Editor.prototype, "destroy");
    const component = await mountSuspended(RichTextEditor, { props: { limit: 100, modelValue: "" } });
    component.unmount();

    expect(destroy).toHaveBeenCalledExactlyOnceWith();
  });
});
