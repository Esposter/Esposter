import { drainDeadLetterContainer } from "#src/services/drainDeadLetterContainer";
import { getContainerClient } from "#src/services/getContainerClient";
import { AzureContainer, DEAD_LETTER_ARCHIVED_PREFIX, DEAD_LETTER_QUARANTINE_PREFIX } from "@esposter/db-schema";
import {
  getMockContainer,
  getMockContainerCreatedOnKey,
  MOCK_BLOB_SEEDED_CREATED_ON,
  MockContainerCreatedOnDatabase,
  MockContainerDatabase,
} from "azure-mock";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/getContainerClient"), () => import("#src/services/getContainerClient.test"));

const readCreatedOn = (blobName: string) =>
  MockContainerCreatedOnDatabase.get(getMockContainerCreatedOnKey(AzureContainer.DeadLetter, blobName));

describe(drainDeadLetterContainer, () => {
  const strandedBlobName = "topic/subscription/2026/8/23/12/stranded.json";
  const freshBlobName = "topic/subscription/2026/8/23/12/fresh.json";
  const content = Buffer.from("");

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  // The three exclusions are given distinct evidence on purpose: the replay's own copies are seeded as old as the
  // Stranded payload, so only the prefix can be what skips them, and the fresh blob is the only recent one, so only
  // The delivery window can be what skips it
  test("re-uploads what no delivery can still reach, and nothing else", async () => {
    expect.hasAssertions();

    const container = getMockContainer(AzureContainer.DeadLetter);
    container.set(strandedBlobName, content);
    container.set(`${DEAD_LETTER_ARCHIVED_PREFIX}${strandedBlobName}`, content);
    container.set(`${DEAD_LETTER_QUARANTINE_PREFIX}${strandedBlobName}`, content);
    const containerClient = await getContainerClient(AzureContainer.DeadLetter);
    await containerClient.getBlockBlobClient(freshBlobName).upload(content, content.length);
    const freshCreatedOn = readCreatedOn(freshBlobName);

    await expect(drainDeadLetterContainer()).resolves.toBe(1);
    expect(readCreatedOn(strandedBlobName)).not.toStrictEqual(MOCK_BLOB_SEEDED_CREATED_ON);
    expect(readCreatedOn(`${DEAD_LETTER_ARCHIVED_PREFIX}${strandedBlobName}`)).toBeUndefined();
    expect(readCreatedOn(`${DEAD_LETTER_QUARANTINE_PREFIX}${strandedBlobName}`)).toBeUndefined();
    expect(readCreatedOn(freshBlobName)).toStrictEqual(freshCreatedOn);
  });

  // The re-upload dates the blob, so it falls back inside the delivery window it was just given — a second start
  // Before that trigger has had its hour does not publish the batch again
  test("leaves a payload it already re-uploaded to the delivery it just triggered", async () => {
    expect.hasAssertions();

    getMockContainer(AzureContainer.DeadLetter).set(strandedBlobName, content);

    await expect(drainDeadLetterContainer()).resolves.toBe(1);
    await expect(drainDeadLetterContainer()).resolves.toBe(0);
  });
});
