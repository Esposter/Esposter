// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import ResourceNoteEditor from "@/components/Resource/Note/Editor.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { getResourceFileBlobName, ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { EditorView } from "@tiptap/pm/view";
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

// The picker is the input the menu's Image button opens: its click is answered with the file the reader chose
const choosesFile = (file: File) => {
  vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(function (this: HTMLInputElement) {
    Object.defineProperty(this, "files", { value: [file] });
    this.dispatchEvent(new Event("change"));
  });
};

describe("resourceNoteEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const assetUrl = getResourceAssetUrl(getResourceFileBlobName(resourceId, hash));
  const file = new File(["a"], "a", { type: MimeType.Png });

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Note }),
      publication: null,
    }));
    trpcMsw.note.readResourceContent.query(() => ({ doc: EMPTY_NOTE_DOC }));
    trpcMsw.note.readResourcePublication.query(() => undefined);
    // The page reads the row before any blade mounts, and the editor's load reads only the content
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });
  afterEach(() => {
    vi.restoreAllMocks();
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

  test("choosing an image from the menu adds it to the note", async () => {
    expect.hasAssertions();

    uploadResourceFileMock.mockResolvedValue(assetUrl);
    choosesFile(file);
    const component = await mountSuspended(ResourceNoteEditor);
    await component.get('[aria-label="Image"]').trigger("click");
    await flushPromises();

    expect(component.findAll(".ProseMirror img").map((image) => image.attributes("src"))).toStrictEqual([assetUrl]);
  });

  // The drop arrives as a drag event on the editor, which the file handler reads for its files and the point it lands on.
  // Happy-dom lays out no box, so that point is the one the test gives the editor's own lookup
  test("dropping an image file onto the note adds it", async () => {
    expect.hasAssertions();

    uploadResourceFileMock.mockResolvedValue(assetUrl);
    vi.spyOn(EditorView.prototype, "posAtCoords").mockReturnValue({ inside: -1, pos: 1 });
    const component = await mountSuspended(ResourceNoteEditor);
    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", { value: { files: [file], getData: () => "", types: ["Files"] } });
    component.get(".ProseMirror").element.dispatchEvent(drop);
    await flushPromises();

    expect(component.findAll(".ProseMirror img").map((image) => image.attributes("src"))).toStrictEqual([assetUrl]);
  });

  // The autosave stores the editor's own JSON, so the document reopened here is the one a save of the added image holds
  test("an added image still shows after the note is saved and reopened", async () => {
    expect.hasAssertions();

    const savedEditor = new Editor({ content: EMPTY_NOTE_DOC, extensions: getNoteExtensions() });
    savedEditor.commands.setImage({ src: assetUrl });
    trpcMsw.note.readResourceContent.query(() => ({ doc: savedEditor.getJSON() }));
    const component = await mountSuspended(ResourceNoteEditor);

    expect(component.findAll(".ProseMirror img").map((image) => image.attributes("src"))).toStrictEqual([assetUrl]);
  });
});
