// @vitest-environment nuxt
import type { Router } from "vue-router";

import { mockTrpcProcedure } from "#shared/test/mockTrpcClient";
import { useUploadFiles } from "@/composables/message/file/useUploadFiles";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { uploadBlocksMock } = vi.hoisted(() => ({ uploadBlocksMock: vi.fn() }));

vi.mock(import("@/services/azure/container/uploadBlocks"), () => ({ uploadBlocks: uploadBlocksMock }));
// Thumbnail generation runs off a canvas the test env has no renderer for, and every case here drives the
// Upload outcome directly — so resolve it to a fixed blob rather than mocking a DOM.
vi.mock(import("@/services/file/generateImageThumbnail"), () => ({
  generateImageThumbnail: () => Promise.resolve(new Blob(["thumbnail"])),
}));

describe(useUploadFiles, () => {
  let router: Router;
  const roomId = crypto.randomUUID();
  const filename = "filename.png";
  const fileId = crypto.randomUUID();

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    // The room store reads the current room off the route; an unlisted room falls back to the platform cap,
    // Which is all this composable needs from it.
    router.currentRoute.value.params.id = roomId;
    mockTrpcProcedure("message.generateUploadFileSasEntities.query").mockResolvedValue([
      { id: fileId, sasUrl: "https://sas.url/original", thumbnailSasUrl: "https://sas.url/thumbnail" },
    ]);
    globalThis.URL.createObjectURL = vi.fn(() => "blob:url");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createFile = () => new File(["file"], filename, { type: "image/png" });

  // The two features that meet here shipped separately: a failed upload reverts its seeded composer rows, and
  // Images upload a thumbnail beside the original. The thumbnail is decorative — the renderer falls back to the
  // Original when its blob is missing — so letting its failure reach the revert throws away originals that are
  // Already in storage, and empties an attachment tray the user watched upload to 100%.
  test("keeps uploaded files when only the thumbnail upload fails", async () => {
    expect.hasAssertions();

    const uploadFileStore = useUploadFileStore();
    const { files } = storeToRefs(uploadFileStore);
    uploadBlocksMock.mockImplementation((_blob: Blob, sasUrl: string) =>
      sasUrl.endsWith("thumbnail") ? Promise.reject(new Error(filename)) : Promise.resolve(),
    );
    await useUploadFiles()([createFile()]);

    expect(files.value).toHaveLength(1);
    expect(mockTrpcProcedure("message.deleteUploadFiles.mutate")).not.toHaveBeenCalled();
  });

  // A revert drops the only reference to blobs that already reached storage — the composer is the sole holder
  // Of these ids, and every other deletion path walks a persisted message entity's files.
  test("reclaims uploaded blobs when the original upload fails", async () => {
    expect.hasAssertions();

    const uploadFileStore = useUploadFileStore();
    const { files } = storeToRefs(uploadFileStore);
    uploadBlocksMock.mockRejectedValue(new Error(filename));
    await useUploadFiles()([createFile()]);

    expect(files.value).toHaveLength(0);
    expect(mockTrpcProcedure("message.deleteUploadFiles.mutate")).toHaveBeenCalledWith({
      files: [{ filename, id: fileId }],
      roomId,
    });
  });
});
