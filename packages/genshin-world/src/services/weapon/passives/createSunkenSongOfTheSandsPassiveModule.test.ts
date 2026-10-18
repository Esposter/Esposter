import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

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
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createSunkenSongOfTheSandsPassiveModule } from "#src/services/weapon/passives/createSunkenSongOfTheSandsPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readMemberBuffs = (effects: readonly KitEffect[], characterId: number) =>
  effects.flatMap((effect) =>
    effect.kind === "buff" && effect.characterId === characterId
      ? [{ amount: effect.amount, attribute: effect.attribute, secondsRemaining: effect.secondsRemaining }]
      : [],
  );

describe(createSunkenSongOfTheSandsPassiveModule, () => {
  // Key of Khaj-Nisut at its first rank: its HP line is the table's. Each Elemental Skill hit adds a stack of 0.12% of the
  // Wielder's Max HP as Elemental Mastery, up to three, and the third stack gives each other deployed member 0.2% of it for
  // Twenty seconds, restarted by a trigger at three stacks
  const sunkenSongOfTheSandsPassiveModule = createSunkenSongOfTheSandsPassiveModule([0.2, 0.0012, 20, 0.3, 0.002, 20]);
  const otherMemberCharacterId = -1;
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const maximumHealth = wielder.attributes.attributeTotalMap[Attribute.Health];
  const onField: DeployedCombatant[] = [{ ...wielder, isOnField: true }];
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

    expect(readElementalMastery(context)).toBe(0.0012 * maximumHealth);
  });

  test("an Elemental Skill hit within 0.3 seconds of the last adds no stack", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 0.1);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect(readElementalMastery(context)).toBe(0.0012 * maximumHealth);
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

    expect(readElementalMastery(context)).toBe(3 * 0.0012 * maximumHealth);
  });

  test("a Normal Attack hit adds no stack", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect(readElementalMastery(context)).toBe(0);
  });

  test("the third stack gives each other deployed member Elemental Mastery of 0.2% of the wielder's Max HP", () => {
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
      [{ amount: 0.002 * maximumHealth, attribute: Attribute.ElementalMastery, secondsRemaining: 20 }],
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
    stepKitSeconds(context, 10);
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect(readMemberBuffs(context.kitEffectState.effects, otherMemberCharacterId)).toStrictEqual([
      { amount: 0.002 * maximumHealth, attribute: Attribute.ElementalMastery, secondsRemaining: 20 },
    ]);
  });

  test("the stacks end twenty seconds after they are gained", () => {
    expect.hasAssertions();

    const context = createContext();
    sunkenSongOfTheSandsPassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    stepKitSeconds(context, 20.1);

    expect(readElementalMastery(context)).toBe(0);
  });
});
