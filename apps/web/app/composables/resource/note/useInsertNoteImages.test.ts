// @vitest-environment nuxt
import type { JSONContent } from "@tiptap/core";

import { MimeType } from "#shared/models/file/MimeType";
import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { useInsertNoteImages } from "@/composables/resource/note/useInsertNoteImages";
import { useResourceStore } from "@/store/resource";
import { getResourceFileBlobName, ResourceType } from "@esposter/db-schema";
import { Editor } from "@tiptap/vue-3";
import { describe, expect, test, vi } from "vitest";

const { uploadResourceFileMock } = vi.hoisted(() => ({
  uploadResourceFileMock: vi.fn<(file: File) => Promise<string>>(),
}));

// The upload itself is covered by useUploadResourceFile's own suite, so this one mocks it at its seam and asserts what
// The insertion does with the url it hands back, or with the refusal it throws
vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => uploadResourceFileMock,
}));

const getImageSources = (content: JSONContent | undefined) =>
  (content?.content ?? []).filter(({ type }) => type === "image").map(({ attrs }) => attrs?.src);

describe(useInsertNoteImages, () => {
  const resourceId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const assetUrl = getResourceAssetUrl(getResourceFileBlobName(resourceId, hash));
  const file = new File(["a"], "a", { type: MimeType.Png });
  // The first paragraph's text starts at 1 and the second's at 8, so the caret and a drop can differ
  const twoParagraphDoc: JSONContent = {
    content: [
      { content: [{ text: "first", type: "text" }], type: "paragraph" },
      { content: [{ text: "second", type: "text" }], type: "paragraph" },
    ],
    type: "doc",
  };

  const setupNote = (content: JSONContent = EMPTY_NOTE_DOC) => {
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    resource.value = createResourceListItem({ id: resourceId, type: ResourceType.Note });
    return new Editor({ content, extensions: getNoteExtensions() });
  };

  // A picked image and a pasted one reach the same insertion without a position, at the caret. A drop carries the point
  // It landed on, and the image goes in there rather than at the caret
  test.each([
    ["at the caret", 8, undefined],
    ["where it is dropped", 1, 8],
  ])("an image goes in %s", async (_title, caretPosition, dropPosition) => {
    expect.hasAssertions();

    uploadResourceFileMock.mockResolvedValue(assetUrl);
    const editor = setupNote(twoParagraphDoc);
    editor.commands.setTextSelection(caretPosition);
    await useInsertNoteImages()(editor, [file], dropPosition);

    expect(getImageSources(editor.getJSON())).toStrictEqual([assetUrl]);
    expect(editor.getJSON().content?.map(({ type }) => type)).toStrictEqual(["paragraph", "image", "paragraph"]);
  });

  // The server refuses an upload that would exceed the quota, and that refusal leaves the note without the image
  test("an image over the storage quota is refused", async () => {
    expect.hasAssertions();

    uploadResourceFileMock.mockRejectedValue(new Error(" "));
    const editor = setupNote();
    await useInsertNoteImages()(editor, [file]);

    expect(getImageSources(editor.getJSON())).toStrictEqual([]);
  });
});
