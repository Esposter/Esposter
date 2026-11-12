// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import ResourceWhiteboardEditorCanvas from "@/components/Resource/Whiteboard/EditorCanvas.vue";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { WHITEBOARD_IMAGE_SIZE } from "@/services/whiteboard/palette/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

const { uploadResourceFileMock } = vi.hoisted(() => ({
  uploadResourceFileMock: vi.fn<(file: File, hash?: string) => Promise<string>>(),
}));

// The upload is covered by useUploadResourceFile's own suite, so it is mocked at its seam here
vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => uploadResourceFileMock,
}));

// A drop carries its files in the event's data transfer, which the event constructor does not take, so it is set on the event
const dropFiles = (target: EventTarget, files: File[], clientX: number, clientY: number) => {
  const event = new MouseEvent("drop", { bubbles: true, cancelable: true, clientX, clientY });
  Object.defineProperty(event, "dataTransfer", { value: { files } });
  target.dispatchEvent(event);
};

describe("resourceWhiteboardEditorCanvas", () => {
  test("the canvas draws no grid", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceWhiteboardEditorCanvas);

    expect(wrapper.find("pattern").exists()).toBe(false);
  });

  test("a dropped image is stored as a file asset and placed at the drop point", async () => {
    expect.hasAssertions();
    const imageFile = new File(["a"], "a.png", { type: MimeType.Png });
    const fileId = await getSha256Hex(new Uint8Array(await imageFile.arrayBuffer()));
    // The drop hashes the file before it uploads it, so the test waits for the upload to be called rather than for a fixed number of ticks
    const uploadCalled = new Promise<void>((resolve) => {
      uploadResourceFileMock.mockImplementation((_file, hash) => {
        resolve();
        return Promise.resolve(hash ?? "");
      });
    });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorCanvas);

    dropFiles(wrapper.element, [imageFile], 300, 200);
    await uploadCalled;
    await flushPromises();

    const [image] = useWhiteboardStore().whiteboard.elements;
    expect(uploadResourceFileMock).toHaveBeenCalledExactlyOnceWith(imageFile, fileId);
    expect(image).toHaveProperty("fileId", fileId);
    expect(image).toHaveProperty("x", 300 - WHITEBOARD_IMAGE_SIZE.width / 2);
    expect(image).toHaveProperty("y", 200 - WHITEBOARD_IMAGE_SIZE.height / 2);
  });

  test("a dropped file that is not an image places nothing", async () => {
    expect.hasAssertions();
    const textFile = new File(["a"], "a.txt", { type: MimeType.PlainText });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorCanvas);

    dropFiles(wrapper.element, [textFile], 300, 200);
    await flushPromises();

    expect(uploadResourceFileMock).not.toHaveBeenCalled();
    expect(useWhiteboardStore().whiteboard.elements).toStrictEqual([]);
  });

  test("a drop that carries no file is left to its target", async () => {
    expect.hasAssertions();
    const wrapper = await mountSuspended(ResourceWhiteboardEditorCanvas);
    const event = new MouseEvent("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: { files: [] } });

    wrapper.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
