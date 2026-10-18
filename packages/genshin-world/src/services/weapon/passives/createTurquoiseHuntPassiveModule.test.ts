import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createTurquoiseHuntPassiveModule } from "#src/services/weapon/passives/createTurquoiseHuntPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createTurquoiseHuntPassiveModule, () => {
  // Turquoise Hunt at its first rank: a stack for each Elemental Skill hit every half second, three stacks for a Burning or
  // Burgeon a nearby party member triggers every two seconds, and 10% Elemental Skill and Burst DMG per stack for six seconds
  const turquoiseHuntPassiveModule = createTurquoiseHuntPassiveModule([0.5, 2, 0.1, 6, 6]);
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
  const createReactionTriggered = (reactionType: ReactionType, striker: Combatant) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered as const,
    reactions: [{ reactionType }],
    striker,
  });
  const createStrike = (attackTag: AttackTag) => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: TRAVELER_KIT.plungeCollision,
  });

  test("an Elemental Skill hit gains a stack that raises Elemental Skill and Burst DMG, and a normal attack is not raised", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    turquoiseHuntPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    const getBonus = (attackTag: AttackTag) =>
      turquoiseHuntPassiveModule.getStrikeDamageBonus?.(
        createStrike(attackTag),
        enemy,
        context.party,
        context.kitEffectState.effects,
      );

    expect(getBonus(AttackTag.ElementalSkill)).toBe(0.1);
    expect(getBonus(AttackTag.ElementalBurst)).toBe(0.1);
    expect(getBonus(AttackTag.NormalAttack)).toBe(0);
  });

  test("a second Elemental Skill hit inside the half second gains no stack, and the stack ends after six seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    turquoiseHuntPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    turquoiseHuntPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    const getSkillBonus = () =>
      turquoiseHuntPassiveModule.getStrikeDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
      );

    expect(getSkillBonus()).toBe(0.1);

    stepKitSeconds(context, 6.1);

    expect(getSkillBonus()).toBe(0);
  });

  test("a Burning or Burgeon a nearby party member triggers gains the wielder three stacks", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    turquoiseHuntPassiveModule.onKitEvent?.(
      createReactionTriggered(ReactionType.Burning, { ...wielder, characterId: 1 }),
      context,
      wielder,
    );

    expect(
      turquoiseHuntPassiveModule.getStrikeDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.1 * 3);
  });

  test("a Burning the wielder itself triggers gains no stacks", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    turquoiseHuntPassiveModule.onKitEvent?.(createReactionTriggered(ReactionType.Burning, wielder), context, wielder);

    expect(
      turquoiseHuntPassiveModule.getStrikeDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });
});
