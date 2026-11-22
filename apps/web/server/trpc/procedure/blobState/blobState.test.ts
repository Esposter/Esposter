import { getMockPublishedTopics, MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory, router } from "#server/trpc/index";
import { createReadBlobStateProcedure } from "#server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "#server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { createMockBucket } from "@esposter/db-mock";
import { getBlobTopic, getSaveBlobName, getStorageBucketBindingName, StorageBucket } from "@esposter/db-schema";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";

class Save {
  value: number;

  constructor(init?: { value: number }) {
    this.value = init?.value ?? 0;
  }
}

// The save blob's topic, which a read of the save names and a save of it publishes
const getSaveTopic = () =>
  getBlobTopic(getStorageBucketBindingName(StorageBucket.UserAssets), getSaveBlobName(getMockSession().user.id));

describe("blob state procedures", () => {
  const saveSchema = z.object({ value: z.number() });
  const blobStateRouter = router({
    readSave: createReadBlobStateProcedure(StorageBucket.UserAssets, Save, saveSchema),
    saveSave: createSaveBlobStateProcedure(
      StorageBucket.UserAssets,
      z.object({ data: saveSchema, etag: z.string().optional() }),
    ),
  });

  beforeAll(async () => {
    ({ bucket: mockBuckets[StorageBucket.UserAssets] } = await createMockBucket(StorageBucket.UserAssets));
  });

  beforeEach(() => {
    MockPublishedTopics.length = 0;
  });

  // A read's topics travel back with its answer, so the save it reads is named by its blob, which a save publishes
  test("a read of a save names the blob it reads in its topics", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    await createCallerFactory(blobStateRouter)(context).readSave();

    expect(
      readTopicsHeader(context.responseHeaders, "readSave").flatMap(({ topics }) => topics.map(({ topic }) => topic)),
    ).toContain(getSaveTopic());
  });

  test("a save publishes the blob it writes", async () => {
    expect.hasAssertions();

    await createCallerFactory(blobStateRouter)(await createMockContext()).saveSave({ data: { value: 1 } });

    expect(getMockPublishedTopics()).toContain(getSaveTopic());
  });
});
