import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createHopeBeyondThePeaksPassiveModule } from "#src/services/weapon/passives/createHopeBeyondThePeaksPassiveModule";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createHopeBeyondThePeaksPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  // Hope Beyond the Peaks at its first rank: 12% Elemental Skill DMG, and 12% more for eight seconds after another member's
  // Elemental Skill. Its climbing Stamina line is not read here
  const passiveModule = createHopeBeyondThePeaksPassiveModule([0.15, 0.12, 0.12, 8]);
  const getSkillStrikeBonus = (effects: readonly KitEffect[]) =>
    passiveModule.getStrikeDamageBonus?.(createWeaponStrike(wielder, AttackTag.ElementalSkill), enemy, party, effects);

  test("the wielder's Elemental Skill is priced with the rank's DMG Bonus while no other member has used a skill", () => {
    expect.hasAssertions();

    expect(getSkillStrikeBonus([])).toBeCloseTo(0.12);
  });

  test("another member's Elemental Skill raises the wielder's Elemental Skill DMG for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: OTHER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);

    expect(getSkillStrikeBonus(context.kitEffectState.effects)).toBeCloseTo(0.24);

    stepKitSeconds(context, 8);

    expect(getSkillStrikeBonus(context.kitEffectState.effects)).toBeCloseTo(0.12);
  });

  test("a normal attack is priced with none of it", () => {
    expect.hasAssertions();

    const strike = createWeaponStrike(wielder, AttackTag.NormalAttack);

    expect(passiveModule.getStrikeDamageBonus?.(strike, enemy, party, [])).toBe(0);
  });
});
