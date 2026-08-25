import { drainDeadLetterContainer } from "#src/services/drainDeadLetterContainer";
import { getContainerClient } from "#src/services/getContainerClient";
import { AzureContainer, DEAD_LETTER_ARCHIVED_PREFIX, DEAD_LETTER_QUARANTINE_PREFIX } from "@esposter/db-schema";
import {
  getMockContainer,
  getMockContainerBlobDatesKey,
  MOCK_BLOB_SEEDED_DATE,
  MockContainerBlobDatesDatabase,
  MockContainerDatabase,
} from "azure-mock";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/getContainerClient"), () => import("#src/services/getContainerClient.test"));

const readLastModified = (blobName: string) =>
  MockContainerBlobDatesDatabase.get(getMockContainerBlobDatesKey(AzureContainer.DeadLetter, blobName))?.lastModified;

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
    const freshLastModified = readLastModified(freshBlobName);

    await expect(drainDeadLetterContainer()).resolves.toBe(1);
    expect(readLastModified(strandedBlobName)).not.toStrictEqual(MOCK_BLOB_SEEDED_DATE);
    expect(readLastModified(`${DEAD_LETTER_ARCHIVED_PREFIX}${strandedBlobName}`)).toBeUndefined();
    expect(readLastModified(`${DEAD_LETTER_QUARANTINE_PREFIX}${strandedBlobName}`)).toBeUndefined();
    expect(readLastModified(freshBlobName)).toStrictEqual(freshLastModified);
  });

  // Every worker cold-starts its own drain, so a scale-out has several listing the same stranded blob before any of
  // Them writes. Exactly one may claim it: the rest would each raise their own trigger, and the replay cap is small
  // Enough that the duplicates burn it in one round and quarantine a payload that still had attempts left
  test("lets exactly one of several concurrent drains claim a stranded payload", async () => {
    expect.hasAssertions();

    getMockContainer(AzureContainer.DeadLetter).set(strandedBlobName, content);

    const drainedCounts = await Promise.all([
      drainDeadLetterContainer(),
      drainDeadLetterContainer(),
      drainDeadLetterContainer(),
    ]);

    expect(drainedCounts.reduce((total, drainedCount) => total + drainedCount, 0)).toBe(1);
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
