import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { YANFEI_CHARACTER_ID } from "#src/services/kit/characters/yanfeiKit";
import { createYanfeiKit } from "#src/services/kit/characters/yanfeiKit";
import { createKitStepContext } from "#src/services/kit/createKitStepContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const YANFEI_KIT = createYanfeiKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [YANFEI_CHARACTER_ID]));

const createYanfeiCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: YANFEI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: YANFEI_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// The seal statuses of the effects held, as the kit counts them
const countSealStatuses = (effects: KitEffect[]): number =>
  effects.filter((effect) => effect.kind === "status" && effect.id.startsWith("yanfei-seal")).length;

describe(createYanfeiKit, () => {
  test("the charged attack spends the Scarlet Seals it starts with, and their count sets its radius", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = {
      effects: [
        { characterId: YANFEI_CHARACTER_ID, id: "yanfei-seal-0", kind: "status", secondsRemaining: 10 },
        { characterId: YANFEI_CHARACTER_ID, id: "yanfei-seal-1", kind: "status", secondsRemaining: 10 },
      ],
    };

    YANFEI_KIT.chargedAttack.onStart?.(createKitStepContext(createYanfeiCombatant(), { kitEffectState }));

    expect(countSealStatuses(kitEffectState.effects)).toBe(0);
    const [summon] = kitEffectState.effects;
    if (summon?.kind !== "summon") throw new Error("the charged attack casts no summon");
    // Two seals give the charge's 3.5 metres, which the targeting area's 5 metres are added to
    expect(summon.hits[0]?.hitArea.radius).toBeCloseTo(8.5);
  });

  test("constellation 6 holds a fourth Scarlet Seal, where three is the most before it", () => {
    expect.hasAssertions();
    const hit = YANFEI_KIT.elementalSkill.hits[0];
    if (!hit?.onStrike) throw new Error("Signed Edict has no seal on hit");
    const kitEffectState: KitEffectState = { effects: [] };

    hit.onStrike(createKitStepContext(createYanfeiCombatant(6), { kitEffectState }));

    expect(countSealStatuses(kitEffectState.effects)).toBe(4);
  });
});
