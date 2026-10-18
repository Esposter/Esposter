import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createLawsEquilibriumPassiveModule } from "#src/services/weapon/passives/createLawsEquilibriumPassiveModule";
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
// Covenant of Frost and Snow at its first rank: 120 Elemental Mastery for twelve seconds after an Elemental Skill
const lawsEquilibriumPassiveModule = createLawsEquilibriumPassiveModule([120, 12, 0, 0]);

describe(createLawsEquilibriumPassiveModule, () => {
  test("the wielder's Elemental Skill raises its Elemental Mastery by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    lawsEquilibriumPassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 120,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "lawsEquilibrium",
      },
    ]);
  });
});
