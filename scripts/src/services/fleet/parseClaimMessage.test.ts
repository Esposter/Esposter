import { parseClaimMessage } from "#src/services/fleet/parseClaimMessage";
import { describe, expect, test } from "vitest";

const CLAIM = {
  claimedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
  entry: "city-areas",
  load: "CPU 4%",
  machine: "pc",
  renewedAt: Temporal.Instant.fromEpochMilliseconds(0).add({ minutes: 10 }).toString(),
};

describe(parseClaimMessage, () => {
  test("reads a claim commit's message back", () => {
    expect.hasAssertions();

    expect(parseClaimMessage(JSON.stringify(CLAIM))).toStrictEqual(CLAIM);
  });

  test("reads a missed claim's text with it", () => {
    expect.hasAssertions();

    expect(parseClaimMessage(JSON.stringify({ ...CLAIM, miss: "3 of 5" }))).toStrictEqual({ ...CLAIM, miss: "3 of 5" });
  });

  test("reads a message that is not JSON, or lacks a readable instant, as no claim", () => {
    expect.hasAssertions();

    expect(parseClaimMessage("not json")).toBeUndefined();
    expect(parseClaimMessage(JSON.stringify({ ...CLAIM, renewedAt: undefined }))).toBeUndefined();
    expect(parseClaimMessage(JSON.stringify({ ...CLAIM, renewedAt: "yesterday" }))).toBeUndefined();
  });
});
