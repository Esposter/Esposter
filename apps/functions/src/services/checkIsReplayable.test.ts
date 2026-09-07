import { checkIsReplayable } from "#src/services/checkIsReplayable";
import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "#src/services/constants";
import { AzureFunction, AzureFunctionIsIdempotentMap } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkIsReplayable, () => {
  const azureFunctions = Object.values(AzureFunction);

  test("under the cap, idempotency alone decides whether an event may go back on the topic", () => {
    expect.hasAssertions();

    for (const azureFunction of azureFunctions)
      for (const replayAttempts of [0, MAX_DEAD_LETTER_REPLAY_ATTEMPTS - 1])
        expect(checkIsReplayable(azureFunction, replayAttempts)).toBe(AzureFunctionIsIdempotentMap[azureFunction]);
  });

  test("at or past the cap, no event is replayable", () => {
    expect.hasAssertions();

    for (const azureFunction of azureFunctions)
      for (const replayAttempts of [MAX_DEAD_LETTER_REPLAY_ATTEMPTS, MAX_DEAD_LETTER_REPLAY_ATTEMPTS + 1])
        expect(checkIsReplayable(azureFunction, replayAttempts)).toBe(false);
  });

  test("an eventType no AzureFunction claims is unroutable", () => {
    expect.hasAssertions();

    expect(checkIsReplayable("", 0)).toBe(false);
  });
});
