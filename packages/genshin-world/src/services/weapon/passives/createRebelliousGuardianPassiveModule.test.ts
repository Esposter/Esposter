import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createRebelliousGuardianPassiveModule } from "#src/services/weapon/passives/createRebelliousGuardianPassiveModule";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// The Bell's Rebellious Guardian at its first rank: a shield of a fifth of Max HP, a cooldown of forty-five seconds and a
// Twelve per cent DMG Bonus
const rebelliousGuardianPassiveModule = createRebelliousGuardianPassiveModule([0.2, 45, 0.12]);

describe(createRebelliousGuardianPassiveModule, () => {
  test("an enemy's strike that takes the wielder's HP generates its shield and the DMG Bonus while it lasts", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    rebelliousGuardianPassiveModule.onKitEvent?.(
      {
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: -0.1,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects.filter(({ kind }) => kind !== "status")).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        health: 0.2 * wielder.attributes.maxHealth,
        kind: "shield",
        secondsRemaining: 10,
      },
      {
        amount: 0.12,
        attribute: Attribute.AllDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: "rebelliousGuardian",
      },
    ]);
  });

  test("a heal, or a loss another character caused, generates no shield", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    rebelliousGuardianPassiveModule.onKitEvent?.(
      {
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: 0.1,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      wielder,
    );
    rebelliousGuardianPassiveModule.onKitEvent?.(
      {
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: -0.1,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
        sourceCharacterId: OTHER_CHARACTER_ID,
      },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });

  test("a second loss inside the rank's forty-five seconds generates no second shield", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const loss = {
      characterId: TRAVELER_CHARACTER_ID,
      healthShare: -0.1,
      kind: KitEventKind.HealthChanged as const,
      overflowHealthShare: 0,
    };
    rebelliousGuardianPassiveModule.onKitEvent?.(loss, context, wielder);
    rebelliousGuardianPassiveModule.onKitEvent?.(loss, context, wielder);

    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "shield")).toHaveLength(1);
  });
});
