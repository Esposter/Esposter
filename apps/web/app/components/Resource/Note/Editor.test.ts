// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceNoteEditor from "@/components/Resource/Note/Editor.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/vue-3";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { uploadResourceFileMock } = vi.hoisted(() => ({
  uploadResourceFileMock: vi.fn<(file: File) => Promise<string>>(),
}));

// The upload is covered by useUploadResourceFile's own suite, so it is mocked at its seam here, and the paste reaches it
// Through the editor's own file handler
vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => uploadResourceFileMock,
}));

describe("resourceNoteEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const assetUrl = getResourceAssetUrl(getResourceFileBlobName(resourceId, hash));
  const file = new File(["a"], "a", { type: MimeType.Png });

  beforeEach(() => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Note }),
      publication: null,
    }));
    trpcMsw.note.readResourceContent.query(() => ({ doc: EMPTY_NOTE_DOC }));
    trpcMsw.note.readResourcePublication.query(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("tears the editor down once on unmount", async () => {
    expect.hasAssertions();

    const destroy = vi.spyOn(Editor.prototype, "destroy");
    const component = await mountSuspended(ResourceNoteEditor);
    component.unmount();

    expect(destroy).toHaveBeenCalledExactlyOnceWith();
  });

  // The paste arrives as a clipboard event on the document, which the editor's file handler reads: the image is
  // Inserted where the caret is, through the upload the same handler routes every pasted image file to
  test("pasting an image adds it to the note", async () => {
    expect.hasAssertions();

    uploadResourceFileMock.mockResolvedValue(assetUrl);
    const component = await mountSuspended(ResourceNoteEditor);
    const paste = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(paste, "clipboardData", { value: { files: [file], getData: () => "" } });
    component.get(".ProseMirror").element.dispatchEvent(paste);
    await flushPromises();

    expect(component.findAll(".ProseMirror img").map((image) => image.attributes("src"))).toStrictEqual([assetUrl]);
  });
});
