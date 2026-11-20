/* oxlint-disable no-await-in-loop -- Pagination: each page's cursor is what the next page is listed with, and a page's expired bodies are deleted before the next page is listed */
import { QUARANTINE_PREFIX } from "#src/services/queue/constants";
import { getBucket } from "#src/services/storage/getBucket";
import { QUARANTINE_RETENTION_MS, StorageBucket } from "@esposter/db-schema";
import { omitUndefined } from "@esposter/shared";

// The nightly purge of quarantined dead letters: every body under the quarantine prefix uploaded past the retention.
// R2 lists a prefix in name order, not by age, so each page is deleted from before the next one is listed.
// A page holds at most R2's listing limit, which is also the most keys one delete request takes
export const purgeExpiredQuarantine = async (): Promise<void> => {
  const bucket = getBucket(StorageBucket.UserAssets);
  const cutoff = Date.now() - QUARANTINE_RETENTION_MS;
  let cursor: string | undefined;
  do {
    const page = await bucket.list(omitUndefined({ cursor, prefix: QUARANTINE_PREFIX }));
    const expiredKeys = page.objects.filter(({ uploaded }) => uploaded.getTime() < cutoff).map(({ key }) => key);
    if (expiredKeys.length > 0) await bucket.delete(expiredKeys);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor !== undefined);
};
