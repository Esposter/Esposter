// @vitest-environment nuxt
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import ResourceNoteAltTextMenuButton from "@/components/Resource/Note/AltTextMenuButton.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/vue-3";
import { describe, expect, test } from "vitest";

describe("resourceNoteAltTextMenuButton", () => {
  const resourceId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const alt = "a";
  const assetUrl = getResourceAssetUrl(getResourceFileBlobName(resourceId, hash));

  // The popover is offered only with an image selected, so the selection is set before the button mounts
  test("setting alt text from the image popover", async () => {
    expect.hasAssertions();

    const editor = new Editor({
      content: { content: [{ attrs: { src: assetUrl }, type: "image" }], type: "doc" },
      extensions: getNoteExtensions(),
    });
    editor.commands.setNodeSelection(0);
    const wrapper = await mountSuspended(ResourceNoteAltTextMenuButton, { props: { editor } });
    await wrapper.get("button").trigger("click");
    await wrapper.get("input").setValue(alt);
    await wrapper.get("form").trigger("submit");

    expect(editor.getJSON().content?.[0]?.attrs?.alt).toBe(alt);
    expect(renderNoteHtml(editor.getJSON())).toContain(`alt="${alt}"`);
  });
});
