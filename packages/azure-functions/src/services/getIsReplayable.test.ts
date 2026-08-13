import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "@/services/constants";
import { getIsReplayable } from "@/services/getIsReplayable";
import { AzureFunction, IsIdempotentAzureFunctionMap } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getIsReplayable, () => {
  const azureFunctions = Object.values(AzureFunction);

  test("under the cap, idempotency alone decides whether an event may go back on the topic", () => {
    expect.hasAssertions();

    for (const azureFunction of azureFunctions)
      for (const replayAttempts of [0, MAX_DEAD_LETTER_REPLAY_ATTEMPTS - 1])
        expect(getIsReplayable(azureFunction, replayAttempts)).toBe(IsIdempotentAzureFunctionMap[azureFunction]);
  });

  test("at or past the cap, no event is replayable", () => {
    expect.hasAssertions();

    for (const azureFunction of azureFunctions)
      for (const replayAttempts of [MAX_DEAD_LETTER_REPLAY_ATTEMPTS, MAX_DEAD_LETTER_REPLAY_ATTEMPTS + 1])
        expect(getIsReplayable(azureFunction, replayAttempts)).toBe(false);
  });

  test("an eventType no AzureFunction claims is unroutable", () => {
    expect.hasAssertions();

    expect(getIsReplayable("", 0)).toBe(false);
  });
});
