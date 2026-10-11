import { ReactionType } from "#src/models/combat/ReactionType";
import {
  LUNAR_CHARGED_CLOUD_FIRST_TICK_SECONDS,
  LUNAR_CHARGED_CLOUD_SECONDS,
  VERDANT_DEW_GATHERING_SECONDS,
} from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { startPartyLunarReactions } from "#src/services/party/startPartyLunarReactions";
import { describe, expect, test } from "vitest";

describe(startPartyLunarReactions, () => {
  test("lets Dew gather after a Lunar-Bloom, and not after a Bloom", () => {
    expect.hasAssertions();

    const lunarBloomParty = createParty([1]);
    const bloomParty = createParty([1]);
    startPartyLunarReactions(lunarBloomParty, [{ reactionType: ReactionType.LunarBloom }]);
    startPartyLunarReactions(bloomParty, [{ reactionType: ReactionType.Bloom }]);

    expect({
      bloom: bloomParty.verdantDew.gatheringSeconds,
      lunarBloom: lunarBloomParty.verdantDew.gatheringSeconds,
    }).toStrictEqual({ bloom: 0, lunarBloom: VERDANT_DEW_GATHERING_SECONDS });
  });

  test("forms the Lunar-Charged cloud 9 frames from its first tick, and keeps a standing one's tick as it lasts again", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    startPartyLunarReactions(party, [{ reactionType: ReactionType.LunarCharged }]);
    const formedCloud = { ...party.lunarChargedCloud };
    party.lunarChargedCloud = { secondsRemaining: 1, tickSeconds: 0.05 };
    startPartyLunarReactions(party, [{ reactionType: ReactionType.LunarCharged }]);

    expect([formedCloud, party.lunarChargedCloud]).toStrictEqual([
      { secondsRemaining: LUNAR_CHARGED_CLOUD_SECONDS, tickSeconds: LUNAR_CHARGED_CLOUD_FIRST_TICK_SECONDS },
      { secondsRemaining: LUNAR_CHARGED_CLOUD_SECONDS, tickSeconds: 0.05 },
    ]);
  });
});
