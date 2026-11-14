// @vitest-environment nuxt
import type { uploadFileToUrl } from "@/services/file/uploadFileToUrl";

import { MimeType } from "#shared/models/file/MimeType";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { useUploadResourceFile } from "@/composables/resource/useUploadResourceFile";
import { StorageStatusError } from "@/models/file/StorageStatusError";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { getResourceFileBlobName, ResourceType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const { getSha256HexMock, uploadFileToUrlMock } = vi.hoisted(() => ({
  getSha256HexMock: vi.fn<typeof getSha256Hex>(),
  uploadFileToUrlMock: vi.fn<typeof uploadFileToUrl>(),
}));

vi.mock(import("@/services/file/uploadFileToUrl"), () => ({ uploadFileToUrl: uploadFileToUrlMock }));
vi.mock(import("@/services/shared/getSha256Hex"), async (importOriginal) => {
  const { getSha256Hex: hashBytes } = await importOriginal();
  getSha256HexMock.mockImplementation(hashBytes);
  return { getSha256Hex: getSha256HexMock };
});

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
    uploadFileToUrlMock.mockRejectedValue(new StorageStatusError(Operation.Create, "uploadFileToUrl", 412));
    const file = createFile();
    const hash = await getSha256Hex(new Uint8Array(await file.arrayBuffer()));
    const assetUrl = await useUploadResourceFile(ResourceType.Webpage, resourceId)(file);

    expect(assetUrl).toBe(getResourceAssetUrl(getResourceFileBlobName(resourceId, hash)));
  });

  test("uploading bytes whose hash the caller passes does not hash them again", async () => {
    expect.hasAssertions();

    generateUploadFileSasEntities();
    uploadFileToUrlMock.mockResolvedValue();
    const hash = "a".repeat(64);
    const assetUrl = await useUploadResourceFile(ResourceType.Webpage, resourceId)(createFile(), hash);

    expect(getSha256HexMock).not.toHaveBeenCalled();
    expect(assetUrl).toBe(getResourceAssetUrl(getResourceFileBlobName(resourceId, hash)));
  });

  // Only the create-only refusal is the bytes already being held, so any other refusal still fails the upload
  test("fails an upload whose commit is refused for another reason", async () => {
    expect.hasAssertions();

    generateUploadFileSasEntities();
    uploadFileToUrlMock.mockRejectedValue(new StorageStatusError(Operation.Create, "uploadFileToUrl", 403));

    const uploadResourceFile = useUploadResourceFile(ResourceType.Webpage, resourceId);

    await expect(uploadResourceFile(createFile())).rejects.toThrowErrorMatchingInlineSnapshot(
      `[StorageStatusError: Invalid operation: Create, name: uploadFileToUrl, Storage answered 403]`,
    );
  });

  // The asset's address is content-addressed, so a second upload of the same bytes must reach the commit as create-only
  test("uploads the file create-only", async () => {
    expect.hasAssertions();

    generateUploadFileSasEntities();
    uploadFileToUrlMock.mockResolvedValue();
    const file = createFile();
    await useUploadResourceFile(ResourceType.Webpage, resourceId)(file);

    expect(uploadFileToUrlMock).toHaveBeenCalledExactlyOnceWith(file, sasUrl, { isCreateOnly: true });
  });
});
