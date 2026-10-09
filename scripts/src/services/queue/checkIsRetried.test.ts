import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { checkIsRetried } from "#src/services/queue/checkIsRetried";
import { MAX_PUSH_ATTEMPTS } from "#src/services/queue/constants";
import { describe, expect, test } from "vitest";

describe(checkIsRetried, () => {
  test("retries a push the remote refused as stale while attempts remain", () => {
    expect.hasAssertions();

    expect(checkIsRetried(QueuePushOutcome.Refused, 1)).toBe(true);
    expect(checkIsRetried(QueuePushOutcome.Refused, MAX_PUSH_ATTEMPTS - 1)).toBe(true);
  });

  test("stops on a refusal once the attempts are spent", () => {
    expect.hasAssertions();

    expect(checkIsRetried(QueuePushOutcome.Refused, MAX_PUSH_ATTEMPTS)).toBe(false);
  });

  test("never retries a push that landed or a replay that waits", () => {
    expect.hasAssertions();

    expect(checkIsRetried(QueuePushOutcome.Pushed, 1)).toBe(false);
    expect(checkIsRetried(QueuePushOutcome.Waiting, 1)).toBe(false);
  });
});
