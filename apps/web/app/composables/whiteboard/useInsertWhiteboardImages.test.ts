// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useInsertWhiteboardImages } from "#src/composables/whiteboard/useInsertWhiteboardImages";
import { getSha256Hex } from "#src/services/shared/getSha256Hex";
import { WHITEBOARD_IMAGE_INSERT_OFFSET, WHITEBOARD_IMAGE_SIZE } from "#src/services/whiteboard/palette/constants";
import { useAlertStore } from "#src/store/alert";
import { useResourceStore } from "#src/store/resource/index";
import { useWhiteboardStore } from "#src/store/resource/whiteboard/index";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";
import { getElementBounds } from "vue-block-editor-headless";

const { deleteResourceFileMock, uploadResourceFileMock } = vi.hoisted(() => ({
  deleteResourceFileMock: vi.fn<(id: string, url: string) => void>(),
  uploadResourceFileMock: vi.fn<(file: File, hash?: string) => Promise<string>>(),
}));

// The upload is covered by useUploadResourceFile's own suite, so it is mocked at its seam here
vi.mock(import("#src/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => uploadResourceFileMock,
}));
vi.mock(import("#src/composables/resource/useDeleteResourceFile"), () => ({
  useDeleteResourceFile: () => deleteResourceFileMock,
}));

const getFileId = async (imageFile: File) => getSha256Hex(new Uint8Array(await imageFile.arrayBuffer()));

describe(useInsertWhiteboardImages, () => {
  const file = new File(["a"], "a", { type: MimeType.Png });
  const secondFile = new File(["b"], "b", { type: MimeType.Png });

  test("a pasted image is stored as a file asset", async () => {
    expect.hasAssertions();
    const fileId = await getFileId(file);
    uploadResourceFileMock.mockResolvedValue(fileId);

    const insertImages = useInsertWhiteboardImages();
    await insertImages([file]);

    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    const [image] = whiteboard.value.elements;
    expect(uploadResourceFileMock).toHaveBeenCalledExactlyOnceWith(file, fileId);
    expect(whiteboard.value.elements).toHaveLength(1);
    expect(image).toHaveProperty("fileId", fileId);
    expect(image).toHaveProperty("type", "image");
  });

  test("a dropped image is stored as a file asset and placed at the drop point", async () => {
    expect.hasAssertions();
    const fileId = await getFileId(file);
    uploadResourceFileMock.mockResolvedValue(fileId);

    const insertImages = useInsertWhiteboardImages();
    await insertImages([file], { x: 300, y: 200 });

    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    const [image] = whiteboard.value.elements;
    expect(uploadResourceFileMock).toHaveBeenCalledExactlyOnceWith(file, fileId);
    expect(whiteboard.value.elements).toHaveLength(1);
    expect(image).toHaveProperty("fileId", fileId);
    expect(image).toHaveProperty("x", 300 - WHITEBOARD_IMAGE_SIZE.width / 2);
    expect(image).toHaveProperty("y", 200 - WHITEBOARD_IMAGE_SIZE.height / 2);
  });

  test("a dropped file that is not an image places nothing", async () => {
    expect.hasAssertions();
    const textFile = new File(["a"], "a.txt", { type: MimeType.PlainText });

    const insertImages = useInsertWhiteboardImages();
    await insertImages([textFile], { x: 300, y: 200 });
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);

    expect(uploadResourceFileMock).not.toHaveBeenCalled();
    expect(whiteboard.value.elements).toStrictEqual([]);
  });

  test("an image that fails to upload alerts and places nothing", async () => {
    expect.hasAssertions();
    uploadResourceFileMock.mockRejectedValue(new Error("The upload was refused"));

    const insertImages = useInsertWhiteboardImages();
    await insertImages([file], { x: 300, y: 200 });
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);

    expect(whiteboard.value.elements).toStrictEqual([]);
    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["The upload was refused"]);
  });

  test("images pasted together are placed in the order they were picked, each a step further along from the one before", async () => {
    expect.hasAssertions();
    const firstFileId = await getFileId(file);
    const secondFileId = await getFileId(secondFile);
    uploadResourceFileMock.mockImplementation(getFileId);

    const insertImages = useInsertWhiteboardImages();
    await insertImages([file, secondFile]);

    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    const bounds = whiteboard.value.elements.map((element) => getElementBounds(element));
    const firstBounds = takeOne(bounds, 0);
    const [firstImage, secondImage] = whiteboard.value.elements;
    expect(whiteboard.value.elements).toHaveLength(2);
    expect(firstImage).toHaveProperty("fileId", firstFileId);
    expect(secondImage).toHaveProperty("fileId", secondFileId);
    expect(takeOne(bounds, 1)).toStrictEqual({
      ...firstBounds,
      x: firstBounds.x + WHITEBOARD_IMAGE_INSERT_OFFSET,
      y: firstBounds.y + WHITEBOARD_IMAGE_INSERT_OFFSET,
    });
  });

  test("an image whose board is switched to while it uploads lands on neither board, and its upload is deleted from the one it went to", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { applyResource, clearResource } = resourceStore;
    const resource = createResourceListItem();
    applyResource(resource, null, null);
    const fileId = await getFileId(file);
    uploadResourceFileMock.mockImplementationOnce(() => {
      clearResource(resource.id);
      applyResource(createResourceListItem(), null, null);
      return Promise.resolve(fileId);
    });
    const insertImages = useInsertWhiteboardImages();
    await insertImages([file]);

    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    expect(whiteboard.value.elements).toHaveLength(0);
    expect(deleteResourceFileMock).toHaveBeenCalledExactlyOnceWith(resource.id, fileId);
  });
});
