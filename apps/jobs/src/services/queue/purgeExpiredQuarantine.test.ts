import { QUARANTINE_PREFIX } from "#src/services/queue/constants";
import { purgeExpiredQuarantine } from "#src/services/queue/purgeExpiredQuarantine";
import { getBucket } from "#src/services/storage/getBucket";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "@esposter/db-mock/workers";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  QUARANTINE_RETENTION_MS,
  QueueJob,
  StorageBucket,
} from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/storage/getBucket"), () => import("@esposter/db-mock/workers"));

// R2 stamps a body's upload time from the real clock, so the clock the purge reads is set from the moment the body was
// Written: a day past the retention, or a day inside it
const clockPastRetention = () =>
  Temporal.Now.instant().add({ milliseconds: QUARANTINE_RETENTION_MS }).add({ hours: 24 }).epochMilliseconds;
const clockWithinRetention = () =>
  Temporal.Now.instant().add({ milliseconds: QUARANTINE_RETENTION_MS }).subtract({ hours: 24 }).epochMilliseconds;

describe(purgeExpiredQuarantine, () => {
  const queueName = getCloudflareResourceName(
    CloudflareEnvironment.Development,
    CloudflareAssetType.Queue,
    QueueJob.DeleteAccount,
  );
  const userId = v7();
  const quarantineKey = `${QUARANTINE_PREFIX}${queueName}/${v7()}.json`;
  // An asset outside the quarantine prefix, a user's own file, which the purge must never touch however old it is
  const userAssetKey = `${userId}/${v7()}`;
  beforeAll(async () => {
    await openMockBuckets([StorageBucket.UserAssets]);
  });

  afterEach(async () => {
    vi.useRealTimers();
    await clearMockBuckets();
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("deletes a quarantined body uploaded past the retention", async () => {
    expect.hasAssertions();

    await getBucket(StorageBucket.UserAssets).put(quarantineKey, "");
    vi.useFakeTimers({ now: clockPastRetention(), toFake: ["Date"] });
    await purgeExpiredQuarantine();

    await expect(getBucket(StorageBucket.UserAssets).head(quarantineKey)).resolves.toBeNull();
  });

  test("keeps a quarantined body uploaded inside the retention", async () => {
    expect.hasAssertions();

    await getBucket(StorageBucket.UserAssets).put(quarantineKey, "");
    vi.useFakeTimers({ now: clockWithinRetention(), toFake: ["Date"] });
    await purgeExpiredQuarantine();

    await expect(getBucket(StorageBucket.UserAssets).head(quarantineKey)).resolves.not.toBeNull();
  });

  test("never deletes an object outside the quarantine prefix, however old it is", async () => {
    expect.hasAssertions();

    await getBucket(StorageBucket.UserAssets).put(quarantineKey, "");
    await getBucket(StorageBucket.UserAssets).put(userAssetKey, "");
    vi.useFakeTimers({ now: clockPastRetention(), toFake: ["Date"] });
    await purgeExpiredQuarantine();

    await expect(getBucket(StorageBucket.UserAssets).head(quarantineKey)).resolves.toBeNull();
    await expect(getBucket(StorageBucket.UserAssets).head(userAssetKey)).resolves.not.toBeNull();
  });
});
