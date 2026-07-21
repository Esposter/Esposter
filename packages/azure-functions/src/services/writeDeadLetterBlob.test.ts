import { getContainerClient } from "@/services/getContainerClient";
import { writeDeadLetterBlob } from "@/services/writeDeadLetterBlob";
import { AzureContainer, DEAD_LETTER_ARCHIVED_PREFIX, DEAD_LETTER_QUARANTINE_PREFIX } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
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

  test("reports only the write that created the copy, not a rewrite of it", async () => {
    expect.hasAssertions();

    const containerClient = await getContainerClient(AzureContainer.DeadLetter);
    const isCreated = await writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content);
    const isRewritten = await writeDeadLetterBlob(containerClient, blobName, DEAD_LETTER_QUARANTINE_PREFIX, content);

    expect(isCreated).toBe(true);
    expect(isRewritten).toBe(false);
  });
});
