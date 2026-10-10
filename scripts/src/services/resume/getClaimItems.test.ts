import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";

import { STALE_MILLISECONDS } from "#src/services/fleet/constants";
import { getClaimItems } from "#src/services/resume/getClaimItems";
import { describe, expect, test } from "vitest";

const createClaim = (machine: string, miss?: string): ClaimedRef => ({
  message: {
    claimedAt: "",
    entry: "e",
    load: "",
    machine,
    miss,
    renewedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
    worker: "w",
  },
  sha: "",
});

describe(getClaimItems, () => {
  test.each([
    ["live with its hold running", 0, createClaim("pc"), true, "live, 0 min", ""],
    ["live with its hold gone", 0, createClaim("pc"), false, "live, 0 min", "hold died"],
    [
      "stale",
      STALE_MILLISECONDS + 1,
      createClaim("pc"),
      true,
      "stale, 30 min",
      "resume it from its handoff, or release with --miss naming what is left",
    ],
    ["missed", 0, createClaim("pc", "left"), true, "missed (left), 0 min", "the coordinator's call"],
  ])("reads a claim %s", (_title, now, claim, isRunning, text, action) => {
    expect.hasAssertions();

    expect(getClaimItems(new Map([["e", claim]]), "pc", [{ entry: "e", isRunning, worker: "w" }], now)).toStrictEqual([
      { action, text: `e pc/w ${text}` },
    ]);
  });

  test("skips another machine's claim", () => {
    expect.hasAssertions();

    expect(getClaimItems(new Map([["e", createClaim("mac")]]), "pc", [], 0)).toStrictEqual([]);
  });
});
