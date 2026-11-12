// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import { useInsertWhiteboardImages } from "@/composables/whiteboard/useInsertWhiteboardImages";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { WHITEBOARD_IMAGE_INSERT_OFFSET, WHITEBOARD_IMAGE_SIZE } from "@/services/whiteboard/palette/constants";
import { useAlertStore } from "@/store/alert";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";
import { getElementBounds } from "vue-block-editor-headless";

const { uploadResourceFileMock } = vi.hoisted(() => ({
  uploadResourceFileMock: vi.fn<(file: File, hash?: string) => Promise<string>>(),
}));

// The upload is covered by useUploadResourceFile's own suite, so it is mocked at its seam here
vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => uploadResourceFileMock,
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
    const [image] = whiteboardStore.whiteboard.elements;
    expect(uploadResourceFileMock).toHaveBeenCalledExactlyOnceWith(file, fileId);
    expect(whiteboardStore.whiteboard.elements).toHaveLength(1);
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
    const [image] = whiteboardStore.whiteboard.elements;
    expect(uploadResourceFileMock).toHaveBeenCalledExactlyOnceWith(file, fileId);
    expect(whiteboardStore.whiteboard.elements).toHaveLength(1);
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

    expect(uploadResourceFileMock).not.toHaveBeenCalled();
    expect(whiteboardStore.whiteboard.elements).toStrictEqual([]);
  });

  test("an image that fails to upload alerts and places nothing", async () => {
    expect.hasAssertions();
    uploadResourceFileMock.mockRejectedValue(new Error("The upload was refused"));

    const insertImages = useInsertWhiteboardImages();
    await insertImages([file], { x: 300, y: 200 });
    const alertStore = useAlertStore();
    const whiteboardStore = useWhiteboardStore();

    expect(whiteboardStore.whiteboard.elements).toStrictEqual([]);
    expect(alertStore.alerts.map(({ text }) => text)).toStrictEqual(["The upload was refused"]);
  });

  test("images pasted together are placed in the order they were picked, each a step further along from the one before", async () => {
    expect.hasAssertions();
    const firstFileId = await getFileId(file);
    const secondFileId = await getFileId(secondFile);
    uploadResourceFileMock.mockImplementation(getFileId);

    const insertImages = useInsertWhiteboardImages();
    await insertImages([file, secondFile]);

    const whiteboardStore = useWhiteboardStore();
    const bounds = whiteboardStore.whiteboard.elements.map((element) => getElementBounds(element));
    const firstBounds = takeOne(bounds, 0);
    const [firstImage, secondImage] = whiteboardStore.whiteboard.elements;
    expect(whiteboardStore.whiteboard.elements).toHaveLength(2);
    expect(firstImage).toHaveProperty("fileId", firstFileId);
    expect(secondImage).toHaveProperty("fileId", secondFileId);
    expect(takeOne(bounds, 1)).toStrictEqual({
      ...firstBounds,
      x: firstBounds.x + WHITEBOARD_IMAGE_INSERT_OFFSET,
      y: firstBounds.y + WHITEBOARD_IMAGE_INSERT_OFFSET,
    });
  });
});
