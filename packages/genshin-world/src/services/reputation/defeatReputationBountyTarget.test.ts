import { HUNT } from "#src/services/reputation/constants.test";
import { defeatReputationBountyTarget } from "#src/services/reputation/defeatReputationBountyTarget";
import { getReputationBountyCampId } from "#src/services/reputation/getReputationBountyCampId";
import { describe, expect, test } from "vitest";

describe(defeatReputationBountyTarget, () => {
  test("a defeat of the bounty's camp marks its target defeated", () => {
    expect.hasAssertions();

    expect(defeatReputationBountyTarget(HUNT, getReputationBountyCampId(HUNT.bountyId))).toStrictEqual({
      ...HUNT,
      isTargetDefeated: true,
    });
  });

  test("a defeat of another camp leaves the hunt as it was", () => {
    expect.hasAssertions();

    expect(defeatReputationBountyTarget(HUNT, "domain-1-2-0")).toStrictEqual(HUNT);
  });
});
