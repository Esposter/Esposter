import { getContainerClient } from "@/services/getContainerClient";
import { writeDeadLetterBlob } from "@/services/writeDeadLetterBlob";
import { AzureContainer, DEAD_LETTER_ARCHIVED_PREFIX, DEAD_LETTER_QUARANTINE_PREFIX } from "@esposter/db-schema";
import { MockContainerDatabase, MockRestError } from "azure-mock";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/getContainerClient"), () => import("@/services/getContainerClient.test"));

describe(writeDeadLetterBlob, () => {
  const blobName = "";
  const content = Buffer.from("");

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("copies under every prefix and leaves the source untouched", async () => {
    expect.hasAssertions();

    const containerClient = await getContainerClient(AzureContainer.DeadLetter);
    await containerClient.getBlockBlobClient(blobName).upload(content, content.length);
    await writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content);
    await writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_ARCHIVED_PREFIX, content);
    const container = MockContainerDatabase.get(AzureContainer.DeadLetter);
    assert.exists(container);

    expect([...container.keys()]).toStrictEqual([
      blobName,
      `${DEAD_LETTER_QUARANTINE_PREFIX}${blobName}`,
      `${DEAD_LETTER_ARCHIVED_PREFIX}${blobName}`,
    ]);
  });

  // Only the write that lost the create race reports false, so a caller announcing the copy announces it once
  // However many deliveries of the same blob race
  test("reports only the write that created the copy, not a redelivery of it", async () => {
    expect.hasAssertions();

    const containerClient = await getContainerClient(AzureContainer.DeadLetter);
    const [isCreated, isRedelivered] = await Promise.all([
      writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content),
      writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content),
    ]);

    expect([isCreated, isRedelivered].filter(Boolean)).toHaveLength(1);
  });

  test("propagates a write failure that is not the copy already existing", async () => {
    expect.hasAssertions();

    const containerClient = await getContainerClient(AzureContainer.DeadLetter);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    vi.spyOn(blockBlobClient, "upload").mockRejectedValue(new MockRestError("Server busy.", 503));
    vi.spyOn(containerClient, "getBlockBlobClient").mockReturnValue(blockBlobClient);

    await expect(
      writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[MockRestError: Server busy.]`);
  });
});
