import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createParty } from "#src/services/party/createParty";
import { stepPartyFall } from "#src/services/party/stepPartyFall";
import { describe, expect, test } from "vitest";

describe(stepPartyFall, () => {
  test("the fall ends on the step its seconds run out, not one step late", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.fallSecondsRemaining = 5;
    for (let step = 0; step < 300; step++) stepPartyFall(party, FIXED_STEP_SECONDS);

    expect(party.fallSecondsRemaining).toBe(0);
  });
});
