import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createBenthicPulsePassiveModule } from "#src/services/weapon/passives/createBenthicPulsePassiveModule";
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
// Song of Stillness, Benthic Pulse at its first rank: sixteen per cent more DMG for eight seconds after the wielder is healed
const benthicPulsePassiveModule = createBenthicPulsePassiveModule([0.16, 8, 0, 0]);
const healthGained: KitEvent = {
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: 0.5,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
};

describe(createBenthicPulsePassiveModule, () => {
  test("a heal of the wielder raises its DMG by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    benthicPulsePassiveModule.onKitEvent?.(healthGained, context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.16,
        attribute: Attribute.AllDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "benthicPulse",
      },
    ]);
  });
});
