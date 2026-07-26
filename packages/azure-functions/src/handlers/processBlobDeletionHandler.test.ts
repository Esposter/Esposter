import type { EventGridEvent } from "@azure/functions";
import type { BlobDeletionEventGridData } from "@esposter/db-schema";

import { processBlobDeletionHandler } from "@/handlers/processBlobDeletionHandler";
import { getContainerClient } from "@/services/getContainerClient";
import { InvocationContext } from "@azure/functions";
import { dayjs } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { MockBlockBlobClient, MockContainerDatabase } from "azure-mock";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/getContainerClient"), () => import("@/services/getContainerClient.test"));

const readContainer = () => {
  const container = MockContainerDatabase.get(AzureContainer.MessageAssets);
  assert.exists(container);
  return [...container.keys()];
};

const createEventGridEvent = (data: BlobDeletionEventGridData): EventGridEvent => ({
  data,
  dataVersion: "1.0",
  eventTime: "1970-01-01T00:00:00.000Z",
  eventType: "",
  id: crypto.randomUUID(),
  metadataVersion: "1",
  subject: "",
  topic: "",
});

const createEvent = (blobNames: string[]) =>
  createEventGridEvent({ blobNames, containerName: AzureContainer.MessageAssets });

const createPrefixEvent = (prefix: string, createdBefore: Date) =>
  createEventGridEvent({ containerName: AzureContainer.MessageAssets, createdBefore, prefix });

describe(processBlobDeletionHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const blobName = "";
  const secondBlobName = " ";
  const prefix = "a";
  const prefixedBlobName = `${prefix}/${blobName}`;
  const content = "";
  const seedBlob = async (name: string) => {
    const containerClient = await getContainerClient(AzureContainer.MessageAssets);
    await containerClient.getBlockBlobClient(name).upload(content, content.length);
  };

  afterEach(() => {
    MockContainerDatabase.clear();
    vi.restoreAllMocks();
  });

  test("deletes every blob in the batch", async () => {
    expect.hasAssertions();

    await seedBlob(blobName);
    await seedBlob(secondBlobName);
    await processBlobDeletionHandler(createEvent([blobName, secondBlobName]), context);

    expect(readContainer()).toStrictEqual([]);
  });

  test("processBlobDeletionHandler is idempotent", async () => {
    expect.hasAssertions();

    const event = createEvent([blobName, secondBlobName]);
    await seedBlob(blobName);
    await processBlobDeletionHandler(event, context);

    await expect(processBlobDeletionHandler(event, context)).resolves.toBeUndefined();

    expect(readContainer()).toStrictEqual([]);
  });

  test("deletes every blob under the prefix", async () => {
    expect.hasAssertions();

    await seedBlob(prefixedBlobName);
    await processBlobDeletionHandler(createPrefixEvent(prefix, dayjs().add(1, "minute").toDate()), context);

    expect(readContainer()).toStrictEqual([]);
  });

  // Delivery is at-least-once and a dead-lettered event can be replayed hours later, so the set the handler
  // Enumerates is the one that existed when the deletion was published — a republish in between must survive
  test("keeps a blob written after the prefix deletion was published", async () => {
    expect.hasAssertions();

    await seedBlob(prefixedBlobName);
    await processBlobDeletionHandler(createPrefixEvent(prefix, new Date(0)), context);

    expect(readContainer()).toStrictEqual([prefixedBlobName]);
  });

  test("rethrows a failing delete so Event Grid redelivers the batch", async () => {
    expect.hasAssertions();

    await seedBlob(blobName);
    vi.spyOn(MockBlockBlobClient.prototype, "deleteIfExists").mockRejectedValue(new Error(" "));

    await expect(
      processBlobDeletionHandler(createEvent([blobName]), context),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(readContainer()).toStrictEqual([blobName]);
  });
});
