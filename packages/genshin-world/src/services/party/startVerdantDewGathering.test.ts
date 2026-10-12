import { ReactionType } from "#src/models/combat/ReactionType";
import { VERDANT_DEW_GATHERING_SECONDS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { startVerdantDewGathering } from "#src/services/party/startVerdantDewGathering";
import { describe, expect, test } from "vitest";

describe(startVerdantDewGathering, () => {
  test("lets Dew gather after a Lunar-Bloom, and not after a Bloom", () => {
    expect.hasAssertions();

    const lunarBloomParty = createParty([1]);
    const bloomParty = createParty([1]);
    startVerdantDewGathering(lunarBloomParty, [{ reactionType: ReactionType.LunarBloom }]);
    startVerdantDewGathering(bloomParty, [{ reactionType: ReactionType.Bloom }]);

    expect({
      bloom: bloomParty.verdantDew.gatheringSeconds,
      lunarBloom: lunarBloomParty.verdantDew.gatheringSeconds,
    }).toStrictEqual({ bloom: 0, lunarBloom: VERDANT_DEW_GATHERING_SECONDS });
  });
});
