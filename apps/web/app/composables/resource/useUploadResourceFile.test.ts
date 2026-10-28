// @vitest-environment nuxt
import type { uploadBlocks } from "@/services/azure/container/uploadBlocks";

import { MimeType } from "#shared/models/file/MimeType";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { useUploadResourceFile } from "@/composables/resource/useUploadResourceFile";
import { BlobStorageStatusError } from "@/models/azure/container/BlobStorageStatusError";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const { uploadBlocksMock } = vi.hoisted(() => ({ uploadBlocksMock: vi.fn<typeof uploadBlocks>() }));

vi.mock(import("@/services/azure/container/uploadBlocks"), () => ({ uploadBlocks: uploadBlocksMock }));

const createFile = () => new File(["a"], "a", { type: MimeType.PlainText });

describe(useUploadResourceFile, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  const sasUrl = "sasUrl";

  const generateUploadFileSasEntities = () => {
    trpcMsw.webpage.generateUploadFileSasEntities.query(() => [{ id: fileId, isHeld: false, sasUrl }]);
  };

  // The commit is refused with 412 when the bytes are already stored at this address, which is the same address
  // The upload would have reported, so the file reads as uploaded there
  test("uploading bytes already held gives the same address", async () => {
    expect.hasAssertions();

    generateUploadFileSasEntities();
    uploadBlocksMock.mockRejectedValue(new BlobStorageStatusError(Operation.Create, "requestBlobStorage", 412));
    const file = createFile();
    const hash = await getSha256Hex(new Uint8Array(await file.arrayBuffer()));
    const assetUrl = await useUploadResourceFile(ResourceType.Webpage, resourceId)(file);

    expect(assetUrl).toBe(getResourceAssetUrl(getResourceFileBlobName(resourceId, hash)));
  });

  // Only the create-only refusal is the bytes already being held, so any other refusal still fails the upload
  test("fails an upload whose commit is refused for another reason", async () => {
    expect.hasAssertions();

    generateUploadFileSasEntities();
    uploadBlocksMock.mockRejectedValue(new BlobStorageStatusError(Operation.Create, "requestBlobStorage", 403));

    const uploadResourceFile = useUploadResourceFile(ResourceType.Webpage, resourceId);

    await expect(uploadResourceFile(createFile())).rejects.toThrowErrorMatchingInlineSnapshot(
      `[BlobStorageStatusError: Invalid operation: Create, name: requestBlobStorage, Blob Storage answered 403]`,
    );
  });

  // The asset's address is content-addressed, so a second upload of the same bytes must reach the commit as create-only
  test("uploads the file create-only", async () => {
    expect.hasAssertions();

    generateUploadFileSasEntities();
    uploadBlocksMock.mockResolvedValue();
    const file = createFile();
    await useUploadResourceFile(ResourceType.Webpage, resourceId)(file);

    expect(uploadBlocksMock).toHaveBeenCalledExactlyOnceWith(file, sasUrl, undefined, { isCreateOnly: true });
  });
});
