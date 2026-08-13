import type { TRPCRouter } from "@@/server/trpc/routers";
import type { inferProcedureInput } from "@trpc/server";
// @vitest-environment nuxt

import { useUploadFiles } from "@/composables/message/file/useUploadFiles";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { noop, takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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
  const roomId = crypto.randomUUID();
  const filename = "a";
  const fileId = crypto.randomUUID();
  // The grant the server mints beside each write target — the composer hands it back to reclaim the upload
  const token = "token";

  beforeEach(() => {
    setActivePinia(createPinia());
    // The room store reads the current room off the route; an unlisted room falls back to the platform cap,
    // Which is all this composable needs from it.
    setCurrentRoomId(roomId);
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

  // Crossing the two features that meet on this path: the composer is keyed by room, and a revert runs after
  // Awaits the user can switch rooms during. Resolved against whichever room is current, the revert finds
  // Nothing of this upload in it — leaving the room the user left holding a stuck attachment whose blob no
  // Delete path can ever name again.
  test("reverts into the room the upload started in after a mid-upload room switch", async () => {
    expect.hasAssertions();

    const otherRoomId = crypto.randomUUID();
    const uploadFileStore = useUploadFileStore();
    const { files } = storeToRefs(uploadFileStore);
    const deleteUploadFiles = vi.fn<(options: { input: DeleteUploadFilesInput }) => void>();
    server.use(trpcMsw.message.deleteUploadFiles.mutation(deleteUploadFiles));
    uploadBlocksMock.mockImplementation(() => {
      setCurrentRoomId(otherRoomId);
      return Promise.reject(new Error(filename));
    });
    await useUploadFiles()([createFile()]);

    expect(deleteUploadFiles).toHaveBeenCalledWith({ input: { files: [{ filename, id: fileId, token }], roomId } });
    expect(files.value).toHaveLength(0);

    setCurrentRoomId(roomId);

    expect(files.value).toHaveLength(0);
  });

  // A revert names the whole batch to the delete, so it must not run while the batch's other uploads are still
  // Writing — the handler deletes what exists, and a PUT that lands after it leaves a blob nothing references.
  test("reclaims blobs only once every upload in the batch has stopped writing", async () => {
    expect.hasAssertions();

    const slowFileId = crypto.randomUUID();
    let isSlowUploadFinished = false;
    server.use(
      trpcMsw.message.generateUploadFileSasEntities.query(() => [
        { id: fileId, sasUrl: "https://sas.url/original", token },
        { id: slowFileId, sasUrl: "https://sas.url/slow", token },
      ]),
    );
    const deleteUploadFiles = vi.fn<(options: { input: DeleteUploadFilesInput }) => void>();
    server.use(trpcMsw.message.deleteUploadFiles.mutation(deleteUploadFiles));
    uploadBlocksMock.mockImplementation((_blob: Blob, sasUrl: string) =>
      sasUrl.endsWith("slow")
        ? new Promise<void>((resolve) => {
            setTimeout(() => {
              isSlowUploadFinished = true;
              resolve();
            }, 0);
          })
        : Promise.reject(new Error(filename)),
    );
    await useUploadFiles()([createFile(), createFile()]);

    expect(isSlowUploadFinished).toBe(true);
    expect(deleteUploadFiles).toHaveBeenCalledWith({
      input: {
        files: [
          { filename, id: fileId, token },
          { filename, id: slowFileId, token },
        ],
        roomId,
      },
    });
  });

  // The renderer reads this instead of inferring a missing thumbnail from a failed image load — that signal is
  // Indistinguishable from an expired read SAS, and every reading of it is wrong for the other case.
  test("records which files got a thumbnail blob", async () => {
    expect.hasAssertions();

    const uploadFileStore = useUploadFileStore();
    const { files } = storeToRefs(uploadFileStore);
    uploadBlocksMock.mockResolvedValue(undefined);
    await useUploadFiles()([createFile()]);

    expect(takeOne(files.value).hasThumbnail).toBe(true);
  });

  test("records no thumbnail when its upload fails", async () => {
    expect.hasAssertions();

    const uploadFileStore = useUploadFileStore();
    const { files } = storeToRefs(uploadFileStore);
    uploadBlocksMock.mockImplementation((_blob: Blob, sasUrl: string) =>
      sasUrl.endsWith("thumbnail") ? Promise.reject(new Error(filename)) : Promise.resolve(),
    );
    await useUploadFiles()([createFile()]);

    expect(takeOne(files.value).hasThumbnail).toBe(false);
  });
});
