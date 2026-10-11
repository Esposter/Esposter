import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";

import { getHoldFilePath } from "#src/services/fleet/getHoldFilePath";
import { getHoldItems } from "#src/services/resume/getHoldItems";
import { describe, expect, test } from "vitest";

describe(getHoldItems, () => {
  const claim = {
    message: { claimedAt: "", entry: "e", load: "", machine: "pc", renewedAt: "", worker: "w" },
    sha: "",
  } satisfies ClaimedRef;

  test.each([
    [true, new Map([["e", claim]]), []],
    [false, new Map([["e", claim]]), ["process dead"]],
    [true, new Map(), ["claim gone"]],
    [true, new Map([["e", { ...claim, message: { ...claim.message, worker: "x" } }]]), ["claim gone"]],
  ])("a hold running %s against claims %j", (isRunning, claimedRefMap, reasons) => {
    expect.hasAssertions();

    expect(getHoldItems([{ entry: "e", isRunning, worker: "w" }], claimedRefMap).map(({ text }) => text)).toStrictEqual(
      reasons.map((reason) => `${getHoldFilePath("e", "w")} ${reason}`),
    );
  });
});
