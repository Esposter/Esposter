import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createParty } from "#src/services/party/createParty";
import { createSunkenSongOfTheSandsPassiveModule } from "#src/services/weapon/passives/createSunkenSongOfTheSandsPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readMemberBuffs = (effects: readonly KitEffect[], characterId: number) =>
  effects.flatMap((effect) =>
    effect.kind === "buff" && effect.characterId === characterId
      ? [{ amount: effect.amount, attribute: effect.attribute, secondsRemaining: effect.secondsRemaining }]
      : [],
  );

describe(createSunkenSongOfTheSandsPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Synthetic params, not the weapon's row, and a first param the module does not read: each Elemental Skill hit
  // Adds a stack of 1% of the wielder's Max HP as Elemental Mastery, up to three, once every 0.4 seconds, and
  // The third stack gives each other deployed member 2% of it for two seconds, restarted by a trigger at three stacks
  const sunkenSongOfTheSandsPassiveModule = createSunkenSongOfTheSandsPassiveModule([0.1, 0.01, 3, 0.4, 0.02, 2]);
  const otherMemberCharacterId = -1;
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.BaseHealth, value: 10_000 }]);
  const maximumHealth = wielder.attributes.maxHealth;
  const onField: DeployedCombatant[] = [createDeployedCombatant(wielder, { isOnField: true })];
  const elementalSkillHit = {
    attackTag: AttackTag.ElementalSkill,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  };
  const normalAttackHit = { ...elementalSkillHit, attackTag: AttackTag.NormalAttack };
  const createContext = () =>
    createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID, otherMemberCharacterId]) });
  const readElementalMastery = (context: ReturnType<typeof createContext>) =>
    sunkenSongOfTheSandsPassiveModule
      .getPassiveBonuses?.(wielder, 1, onField, context.kitEffectState.effects)
      ?.find(({ attribute }) => attribute === Attribute.ElementalMastery)?.amount;

  test("an Elemental Skill hit gives the wielder Elemental Mastery of 0.12% of its Max HP", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect(readElementalMastery(context)).toBe(0.01 * maximumHealth);
  });

  test("an Elemental Skill hit within 0.4 seconds of the last adds no stack", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.1);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect(readElementalMastery(context)).toBe(0.01 * maximumHealth);
  });

  test("the stacks stop at three", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.5);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.5);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.5);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect(readElementalMastery(context)).toBe(3 * 0.01 * maximumHealth);
  });

  test("a Normal Attack hit adds no stack", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect(readElementalMastery(context)).toBe(0);
  });

  test("the third stack gives each other deployed member Elemental Mastery of 2% of the wielder's Max HP", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.5);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.5);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect([
      readMemberBuffs(context.kitEffectState.effects, otherMemberCharacterId),
      readMemberBuffs(context.kitEffectState.effects, TRAVELER_CHARACTER_ID),
    ]).toStrictEqual([
      [{ amount: 0.02 * maximumHealth, attribute: Attribute.ElementalMastery, secondsRemaining: 2 }],
      [],
    ]);
  });

  test("a trigger at three stacks restarts the other members' buff", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.5);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.5);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 1);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect(readMemberBuffs(context.kitEffectState.effects, otherMemberCharacterId)).toStrictEqual([
      { amount: 0.02 * maximumHealth, attribute: Attribute.ElementalMastery, secondsRemaining: 2 },
    ]);
  });

  test("the stacks end three seconds after they are gained", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 3.1);

    expect(readElementalMastery(context)).toBe(0);
  });
});
