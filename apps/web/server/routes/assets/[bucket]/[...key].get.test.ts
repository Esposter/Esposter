import type { R2Bucket } from "@cloudflare/workers-types";
import type { RequestEvent } from "nuxt/server";

import assetRoute from "#server/routes/assets/[bucket]/[...key].get";
import { TEST_FILENAME } from "#server/routes/assets/[bucket]/constants.test";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockBuckets } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const createEvent = (bucket: string, key: string) =>
  ({ context: { params: { bucket, key } }, res: { headers: new Headers() } }) as unknown as RequestEvent;

describe("routes/assets/[bucket]/[...key]", () => {
  const key = TEST_FILENAME;
  const body = " ";
  const storageBuckets = [
    StorageBucket.PublicDungeonsAssets,
    StorageBucket.PublicHostedAssets,
    StorageBucket.PublicUserAssets,
  ];
  let buckets: Map<StorageBucket, R2Bucket>;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ buckets, dispose } = await createMockBuckets(storageBuckets));
    for (const [storageBucket, bucket] of buckets) mockBuckets[storageBucket] = bucket;
    await Promise.all(Array.from(buckets.values(), (bucket) => bucket.put(key, body)));
  });

  afterAll(async () => {
    for (const storageBucket of storageBuckets) delete mockBuckets[storageBucket];
    await dispose();
  });

  test.each([StorageBucket.PublicDungeonsAssets, StorageBucket.PublicHostedAssets])(
    "refuses %s as a 404 though its object is stored",
    async (storageBucket) => {
      expect.hasAssertions();

      await expect(assetRoute(createEvent(storageBucket, key))).rejects.toThrowErrorMatchingInlineSnapshot(
        `[HTTPError: HTTPError 404]`,
      );
    },
  );

  test("serves a user's public object", async () => {
    expect.hasAssertions();

    const response = await assetRoute(createEvent(StorageBucket.PublicUserAssets, key));

    const { value } = await response.getReader().read();
    expect(new TextDecoder().decode(value)).toBe(body);
  });
});
