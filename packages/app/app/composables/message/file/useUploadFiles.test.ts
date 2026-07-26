import type { TRPCRouter } from "@@/server/trpc/routers";
import type { inferProcedureInput } from "@trpc/server";
// @vitest-environment nuxt
import type { Router } from "vue-router";

import { useUploadFiles } from "@/composables/message/file/useUploadFiles";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { noop } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { uploadBlocksMock } = vi.hoisted(() => ({
  uploadBlocksMock: vi.fn<(blob: Blob, sasUrl: string) => Promise<void>>(),
}));

vi.mock(import("@/services/azure/container/uploadBlocks"), () => ({ uploadBlocks: uploadBlocksMock }));
// Thumbnail generation downscales through a canvas the test env has no renderer for, and every case here
// Drives the upload outcome directly — so resolve it to a fixed blob rather than standing up a DOM.
vi.mock(import("@/services/file/generateImageThumbnail"), () => ({
  generateImageThumbnail: () => Promise.resolve(new Blob(["thumbnail"])),
}));

// Taken off the router rather than re-declared, so a change to the procedure's input fails here.
type DeleteUploadFilesInput = inferProcedureInput<TRPCRouter["message"]["deleteUploadFiles"]>;

describe(useUploadFiles, () => {
  const server = setupMswTrpc();
  let router: Router;
  const roomId = crypto.randomUUID();
  const filename = "a";
  const fileId = crypto.randomUUID();
  // The grant the server mints beside each write target — the composer hands it back to reclaim the upload
  const token = "token";

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    // The room store reads the current room off the route; an unlisted room falls back to the platform cap,
    // Which is all this composable needs from it.
    router.currentRoute.value.params.id = roomId;
    server.use(
      trpcMsw.message.generateUploadFileSasEntities.query(() => [
        { id: fileId, sasUrl: "https://sas.url/original", thumbnailSasUrl: "https://sas.url/thumbnail", token },
      ]),
    );
    vi.spyOn(globalThis.URL, "createObjectURL").mockReturnValue("blob:url");
    vi.spyOn(globalThis.URL, "revokeObjectURL").mockImplementation(noop);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createFile = () => new File(["a"], filename, { type: "image/png" });

  // The two features that meet here shipped separately: a failed upload reverts its seeded composer rows, and
  // Images upload a thumbnail beside the original. The thumbnail is decorative — the renderer falls back to the
  // Original when its blob is missing — so letting its failure reach the revert throws away originals that are
  // Already in storage, and empties an attachment tray the user watched upload to 100%.
  test("keeps uploaded files when only the thumbnail upload fails", async () => {
    expect.hasAssertions();

    const uploadFileStore = useUploadFileStore();
    const { files } = storeToRefs(uploadFileStore);
    const deleteUploadFiles = vi.fn<(options: { input: DeleteUploadFilesInput }) => void>();
    server.use(trpcMsw.message.deleteUploadFiles.mutation(deleteUploadFiles));
    uploadBlocksMock.mockImplementation((_blob: Blob, sasUrl: string) =>
      sasUrl.endsWith("thumbnail") ? Promise.reject(new Error(filename)) : Promise.resolve(),
    );
    await useUploadFiles()([createFile()]);

    expect(files.value).toHaveLength(1);
    expect(deleteUploadFiles).not.toHaveBeenCalled();
  });

  // A revert drops the only reference to blobs that already reached storage — the composer is the sole holder
  // Of these ids, and every other deletion path walks a persisted message entity's files.
  test("reclaims uploaded blobs when the original upload fails", async () => {
    expect.hasAssertions();

    const uploadFileStore = useUploadFileStore();
    const { files } = storeToRefs(uploadFileStore);
    const deleteUploadFiles = vi.fn<(options: { input: DeleteUploadFilesInput }) => void>();
    server.use(trpcMsw.message.deleteUploadFiles.mutation(deleteUploadFiles));
    uploadBlocksMock.mockRejectedValue(new Error(filename));
    await useUploadFiles()([createFile()]);

    expect(files.value).toHaveLength(0);
    expect(deleteUploadFiles).toHaveBeenCalledWith({ input: { files: [{ filename, id: fileId, token }], roomId } });
  });
});
