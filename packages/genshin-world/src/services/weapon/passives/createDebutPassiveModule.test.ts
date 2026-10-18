import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDebutPassiveModule } from "#src/services/weapon/passives/createDebutPassiveModule";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
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
// The Widsith's Debut at its first rank: the Recitative's ATK, the Aria's Elemental DMG and the Interlude's Elemental
// Mastery, a theme for ten seconds, and a cooldown of thirty
const debutPassiveModule = createDebutPassiveModule([0.6, 0.48, 240, 10, 30]);
const createTakeField = () => ({
  characterId: TRAVELER_CHARACTER_ID,
  kind: KitEventKind.CharacterSwapped as const,
  previousCharacterId: OTHER_CHARACTER_ID,
});

describe(createDebutPassiveModule, () => {
  test("taking the field with a roll on the first theme gains its ATK for its ten seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    debutPassiveModule.onKitEvent?.(createTakeField(), context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([{ amount: 0.6, attribute: Attribute.AttackPercent, secondsRemaining: 10 }]);
  });

  test("a roll on the second theme gains the Elemental DMG Bonus of every element at the rank's amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { random: () => 0.5 });
    debutPassiveModule.onKitEvent?.(createTakeField(), context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute }) => ({ amount, attribute })),
    ).toStrictEqual(ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.48, attribute })));
  });

  test("taking the field again inside the rank's thirty seconds gains no theme", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    debutPassiveModule.onKitEvent?.(createTakeField(), context, wielder);
    debutPassiveModule.onKitEvent?.(createTakeField(), context, wielder);

    expect(
      context.kitEffectState.effects.filter((effect) => effect.kind === "buff").map(({ attribute }) => attribute),
    ).toStrictEqual([Attribute.AttackPercent]);
  });
});
