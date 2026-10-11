import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { KAZUHA_CHARACTER_ID } from "#src/services/character/constants";
import { createKazuhaKit } from "#src/services/kit/characters/kazuhaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const KAZUHA_KIT = createKazuhaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [KAZUHA_CHARACTER_ID]));

const createKazuhaCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KAZUHA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: KAZUHA_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

describe(createKazuhaKit, () => {
  test("Constellation 1 takes a tenth off Chihayaburu's cooldown", () => {
    expect.hasAssertions();
    const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const cooldown = (constellationCount: number) =>
      KAZUHA_KIT.skillCooldownSeconds *
      (KAZUHA_KIT.getSkillCooldownMultiplier?.({
        body,
        combatant: createKazuhaCombatant(constellationCount),
        kitEffectState: { effects: [] },
      }) ?? 1);

    expect(cooldown(0)).toBeCloseTo(6);
    expect(cooldown(1)).toBeCloseTo(5.4);
  });

  test("Constellation 6 gives Anemo to Kazuha's attacks as Chihayaburu is cast", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    KAZUHA_KIT.elementalSkill.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: createKazuhaCombatant(6),
      kitEffectState,
    });

    expect(kitEffectState.effects).toStrictEqual([
      { characterId: KAZUHA_CHARACTER_ID, element: Element.Anemo, kind: "infusion", secondsRemaining: 5 },
    ]);
  });
});
