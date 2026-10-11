import { describe, expect, test } from "vitest";

import { QUEUE_SYNC_MILLISECONDS } from "../constants";
import { getQueueSyncDue } from "./getQueueSyncDue";

describe(getQueueSyncDue, () => {
  const ONE_MINUTE_MILLISECONDS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
  const LAST_SYNC_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
  const DUE_MS = LAST_SYNC_MS + QUEUE_SYNC_MILLISECONDS;

  test("is due once no sync has started", () => {
    expect.hasAssertions();

    expect(getQueueSyncDue(0, ONE_MINUTE_MILLISECONDS, false)).toBe(true);
  });

  test("is not due before the sync interval has passed since the last sync", () => {
    expect.hasAssertions();

    expect(getQueueSyncDue(LAST_SYNC_MS, DUE_MS - ONE_MINUTE_MILLISECONDS, false)).toBe(false);
  });

  test("is due once the sync interval has passed since the last sync", () => {
    expect.hasAssertions();

    expect(getQueueSyncDue(LAST_SYNC_MS, DUE_MS, false)).toBe(true);
  });

  test("is not due while a turn is running", () => {
    expect.hasAssertions();

    expect(getQueueSyncDue(LAST_SYNC_MS, DUE_MS, true)).toBe(false);
  });
});
