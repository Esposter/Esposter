import type { ContainerClient } from "@azure/storage-blob";
import type { Resource } from "@esposter/db-schema";

import { createSnapshotObjectStore } from "@@/server/services/resource/snapshot/createSnapshotObjectStore";
import { MockRestError } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

const { containerClientMock } = vi.hoisted(() => ({
  containerClientMock: {} as { current: ContainerClient },
}));

vi.mock(import("@@/server/composables/azure/container/useContainerClient"), () => ({
  useContainerClient: () => Promise.resolve(containerClientMock.current),
}));

describe(createSnapshotObjectStore, () => {
  const resourceId: Resource["id"] = crypto.randomUUID();
  const hash = "hash";
  const bytes = new Uint8Array([1, 2, 3]);

  const getObjectStore = (uploadError: Error) => {
    containerClientMock.current = {
      getBlockBlobClient: () => ({ upload: () => Promise.reject(uploadError) }),
    } as unknown as ContainerClient;
    return createSnapshotObjectStore(resourceId);
  };

  // A single-shot upload violates `ifNoneMatch: "*"` as 409, Put Blob's own special case for a create-only
  // Write. A multi-block upload staged and committed separately violates the same condition as the generic 412
  // Every other conditional write uses — both mean the same thing: this write's twin landed first
  test.each([
    ["single-shot upload", 409],
    ["staged block list commit", 412],
  ])("reports a %s conflict as a deduplicated write rather than throwing", async (_, statusCode) => {
    expect.hasAssertions();

    const objectStore = await getObjectStore(new MockRestError("conflict", statusCode));

    await expect(objectStore.write(hash, bytes)).resolves.toBe(false);
  });

  test("rethrows an upload failure that is not a conditional-write conflict", async () => {
    expect.hasAssertions();

    const objectStore = await getObjectStore(new MockRestError("The server is busy.", 503));

    await expect(objectStore.write(hash, bytes)).rejects.toThrow("The server is busy.");
  });
});
