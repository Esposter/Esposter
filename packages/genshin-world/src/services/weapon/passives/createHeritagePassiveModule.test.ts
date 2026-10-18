import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createHeritagePassiveModule } from "#src/services/weapon/passives/createHeritagePassiveModule";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 10_000_066;
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
// Heritage at its first rank: the ATK percentage, its seconds and the cooldown on its wielder
const heritagePassiveModule = createHeritagePassiveModule([0.24, 10, 20]);
const createCharacterSwapped = () => ({
  characterId: OTHER_CHARACTER_ID,
  kind: KitEventKind.CharacterSwapped as const,
  previousCharacterId: TRAVELER_CHARACTER_ID,
});
const getAttackBuffs = (kitEffectState: KitEffectState): KitBuff[] =>
  kitEffectState.effects.filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.AttackPercent,
  );

describe(createHeritagePassiveModule, () => {
  test("a character swapped onto the field gains the rank's ATK percentage for its seconds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    heritagePassiveModule.onKitEvent?.(createCharacterSwapped(), context, wielder);

    const [buff] = getAttackBuffs(kitEffectState);
    expect(buff?.amount).toBeCloseTo(0.24);
    expect(buff?.characterId).toBe(OTHER_CHARACTER_ID);
    expect(buff?.secondsRemaining).toBe(10);
  });

  test("a second swap inside the rank's cooldown gains nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    heritagePassiveModule.onKitEvent?.(createCharacterSwapped(), context, wielder);
    heritagePassiveModule.onKitEvent?.(createCharacterSwapped(), context, wielder);

    expect(getAttackBuffs(kitEffectState)).toHaveLength(1);
  });
});
