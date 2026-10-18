import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createThePartingRefrainPassiveModule } from "#src/services/weapon/passives/createThePartingRefrainPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readBuffed = (context: KitContext, wielder: Combatant, attribute: Attribute): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[attribute];

describe(createThePartingRefrainPassiveModule, () => {
  // The Parting Refrain at its first rank: 60 Elemental Mastery, and a Sigil of Remembrance from each Elemental Skill or Burst
  // Hit every 0.2 seconds. At four Sigils, Farewell Song lasts 12 seconds on the team with 100 Elemental Mastery and 20% ATK,
  // And no Sigil is gained for 20 seconds after it
  const thePartingRefrainPassiveModule = createThePartingRefrainPassiveModule([60, 0.2, 12, 100, 0.2, 20]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("the wielder's Elemental Mastery is raised by the rank's amount", () => {
    expect.hasAssertions();

    expect(thePartingRefrainPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 60, attribute: Attribute.ElementalMastery },
    ]);
  });

  test("four Sigils from Elemental Skill and Burst hits raise the team's Elemental Mastery and ATK for twelve seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID]) });
    for (const attackTag of [
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
    ]) {
      thePartingRefrainPassiveModule.onKitEvent?.(createDamageTaken(attackTag), context, wielder);
      stepKitSeconds(context, 0.3);
    }

    expect(readBuffed(context, wielder, Attribute.ElementalMastery)).toBe(100);
    expect(readBuffed(context, wielder, Attribute.AttackPercent)).toBe(0.2);

    stepKitSeconds(context, 12.1);

    expect(readBuffed(context, wielder, Attribute.ElementalMastery)).toBe(0);
    expect(readBuffed(context, wielder, Attribute.AttackPercent)).toBe(0);
  });

  test("a hit inside the Sigil cooldown adds no Sigil", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID]) });
    thePartingRefrainPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    thePartingRefrainPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalBurst), context, wielder);
    stepKitSeconds(context, 0.3);
    thePartingRefrainPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    stepKitSeconds(context, 0.3);
    thePartingRefrainPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalBurst), context, wielder);

    expect(readBuffed(context, wielder, Attribute.ElementalMastery)).toBe(0);
  });

  test("no Sigil is gained for twenty seconds after Farewell Song", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID]) });
    for (const attackTag of [
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
    ]) {
      thePartingRefrainPassiveModule.onKitEvent?.(createDamageTaken(attackTag), context, wielder);
      stepKitSeconds(context, 0.3);
    }

    stepKitSeconds(context, 12.1);

    for (const attackTag of [
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
    ]) {
      thePartingRefrainPassiveModule.onKitEvent?.(createDamageTaken(attackTag), context, wielder);
      stepKitSeconds(context, 0.3);
    }

    expect(readBuffed(context, wielder, Attribute.ElementalMastery)).toBe(0);
  });
});
