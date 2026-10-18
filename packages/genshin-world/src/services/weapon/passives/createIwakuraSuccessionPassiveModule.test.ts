import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createIwakuraSuccessionPassiveModule } from "#src/services/weapon/passives/createIwakuraSuccessionPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Iwakura Succession at its first rank: seeds last thirty seconds, three at most, a seed on a five-second cooldown, and six
// Energy a seed
const iwakuraSuccessionPassiveModule = createIwakuraSuccessionPassiveModule([30, 3, 5, 6]);
const SEED_ID = "succession";
const SKILL_USED = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const };
const BURST_USED = { characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed as const };

describe(createIwakuraSuccessionPassiveModule, () => {
  test("a skill use gains a seed, and a second use inside the cooldown gains none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    iwakuraSuccessionPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);
    iwakuraSuccessionPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, SEED_ID)).toBe(1);
  });

  test("a seed is gained again after the cooldown, up to the maximum", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let use = 0; use < 4; use++) {
      iwakuraSuccessionPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);
      stepKitSeconds(context, 5.5);
    }

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, SEED_ID)).toBe(3);
  });

  test("a burst consumes the seeds and gives their energy two seconds later", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    iwakuraSuccessionPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);
    stepKitSeconds(context, 5.5);
    iwakuraSuccessionPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);
    iwakuraSuccessionPassiveModule.onKitEvent?.(BURST_USED, context, wielder);

    expect(countKitHolds(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, SEED_ID)).toBe(0);
    expect(findKitStatus(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, "successionEnergy")?.stacks).toBe(12);

    iwakuraSuccessionPassiveModule.onKitEvent?.(
      {
        effect: {
          characterId: TRAVELER_CHARACTER_ID,
          id: "successionEnergy",
          kind: "status",
          secondsRemaining: 0,
          stacks: 12,
        },
        kind: KitEventKind.EffectExpired,
      },
      context,
      wielder,
    );

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(12);
  });
});
