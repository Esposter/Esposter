import { FIXED_STEP_SECONDS } from "#src/services/constants";
import {
  VERDANT_DEW_GATHER_SECONDS,
  VERDANT_DEW_GATHERING_SECONDS,
  VERDANT_DEW_MAXIMUM_COUNT,
} from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { stepVerdantDew } from "#src/services/party/stepVerdantDew";
import { describe, expect, test } from "vitest";

describe(stepVerdantDew, () => {
  test("gathers a Dew in 146 of the 149 frames a Lunar-Bloom lets it gather, keeping the rest toward the next", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.verdantDew.gatheringSeconds = VERDANT_DEW_GATHERING_SECONDS;
    stepVerdantDew(party, VERDANT_DEW_GATHER_SECONDS);
    stepVerdantDew(party, 1);
    stepVerdantDew(party, 1);

    expect(party.verdantDew).toStrictEqual({ count: 1, gatheredSeconds: expect.closeTo(3 / 60), gatheringSeconds: 0 });
  });

  test("gathers nothing past the most Dew a party holds", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.verdantDew = {
      count: VERDANT_DEW_MAXIMUM_COUNT,
      gatheredSeconds: 0,
      gatheringSeconds: VERDANT_DEW_GATHERING_SECONDS,
    };
    stepVerdantDew(party, VERDANT_DEW_GATHERING_SECONDS);

    expect(party.verdantDew).toStrictEqual({
      count: VERDANT_DEW_MAXIMUM_COUNT,
      gatheredSeconds: 0,
      gatheringSeconds: 0,
    });
  });

  test("the gathering ends on the step its seconds run out, not one step late", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.verdantDew.gatheringSeconds = 5;
    for (let step = 0; step < 300; step++) stepVerdantDew(party, FIXED_STEP_SECONDS);

    expect(party.verdantDew.gatheringSeconds).toBe(0);
  });
});
