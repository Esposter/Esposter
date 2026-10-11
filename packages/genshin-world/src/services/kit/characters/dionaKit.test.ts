import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createDionaKit, DIONA_CHARACTER_ID } from "#src/services/kit/characters/dionaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const DIONA_KIT = createDionaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [DIONA_CHARACTER_ID]));

const createDionaCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: DIONA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: DIONA_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

// The shield an action's start sets on the team
const castShield = (action: KitAction, combatant = createDionaCombatant()): KitShield => {
  const context = createKitTestContext(combatant);
  action.onStart?.(context);
  const shield = context.kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
  if (!shield) throw new Error("Icy Paws sets no shield");
  return shield;
};

describe(createDionaKit, () => {
  const holdAction = DIONA_KIT.elementalSkillHolds?.[0]?.action;

  test("the hold's shield is the tap's shield times the hold's bonus", () => {
    expect.hasAssertions();
    if (!holdAction) throw new Error("Icy Paws has no hold");

    const tapShield = castShield(DIONA_KIT.elementalSkill);
    const holdShield = castShield(holdAction);

    expect(holdShield.health / tapShield.health).toBeCloseTo(1.8);
  });

  test("constellation 2 raises the shield by 15%", () => {
    expect.hasAssertions();
    const tapShield = castShield(DIONA_KIT.elementalSkill, createDionaCombatant(0));
    const constellationShield = castShield(DIONA_KIT.elementalSkill, createDionaCombatant(2));

    expect(constellationShield.health / tapShield.health).toBeCloseTo(1.15);
  });
});
