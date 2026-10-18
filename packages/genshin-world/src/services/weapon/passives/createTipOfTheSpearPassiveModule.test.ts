import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createTipOfTheSpearPassiveModule } from "#src/services/weapon/passives/createTipOfTheSpearPassiveModule";
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
// Rightful Reward, Tip of the Spear at its first rank: eight Energy for a heal of the wielder, once every ten seconds
const tipOfTheSpearPassiveModule = createTipOfTheSpearPassiveModule([8, 10, 0, 0]);
const healthGained: KitEvent = {
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: 0.5,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
};

describe(createTipOfTheSpearPassiveModule, () => {
  test("a heal of the wielder restores the rank's Energy to it, even off the field", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    tipOfTheSpearPassiveModule.onKitEvent?.(healthGained, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(8);
  });

  test("a second heal inside the ten-second cooldown restores nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    tipOfTheSpearPassiveModule.onKitEvent?.(healthGained, context, wielder);
    tipOfTheSpearPassiveModule.onKitEvent?.(healthGained, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(8);

    stepKitSeconds(context, 10.5);
    tipOfTheSpearPassiveModule.onKitEvent?.(healthGained, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(16);
  });
});
