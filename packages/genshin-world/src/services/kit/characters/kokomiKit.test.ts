import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { KOKOMI_CHARACTER_ID } from "#src/services/character/constants";
import { createKokomiKit } from "#src/services/kit/characters/kokomiKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const KOKOMI_KIT = createKokomiKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [KOKOMI_CHARACTER_ID]));
const MAX_HEALTH = 10_000;

const createKokomiCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: KOKOMI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KOKOMI_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

describe(createKokomiKit, () => {
  test("nereid's ascension's garment gives Kokomi's normal attacks a share of her Max HP to their damage, for ten seconds", () => {
    expect.hasAssertions();
    const combatant = createKokomiCombatant();
    const kitEffectState: KitEffectState = { effects: [] };

    KOKOMI_KIT.elementalBurst.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant,
      kitEffectState,
    });
    const garment = kitEffectState.effects.find((effect) => effect.kind === "stance");
    if (garment?.kind !== "stance") throw new Error("Nereid's Ascension starts no garment");
    const [firstNormalAttack] = garment.actions.normalAttacks;
    const bonus = firstNormalAttack?.hits[0]?.additiveBaseDamageBonus?.(combatant);

    expect(garment.secondsRemaining).toBe(10);
    expect(bonus).toBeCloseTo(0.0484 * MAX_HEALTH);
  });
});
