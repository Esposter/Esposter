import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { HEART_OF_THE_FURNACE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createHeartOfTheFurnaceSetModule } from "#src/services/artifact/sets/createHeartOfTheFurnaceSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(HEART_OF_THE_FURNACE_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
const createCombatant = (characterId: number, kit = KIT): Combatant => {
  const attributes = computeCharacterAttributes([]);
  return { ascension: 0, attributes, characterId, constellationCount: 0, elementalResonances: [], kit, level: 1 };
};
// A wearer of four pieces and another member, with the party in the order given
const createTeam = (characterIds: number[]) => {
  const wearer = createCombatant(
    TRAVELER_CHARACTER_ID,
    getPassiveKit(KIT, [createHeartOfTheFurnaceSetModule(bonusOf(4))]),
  );
  const other = createCombatant(OTHER_CHARACTER_ID);
  const characterIdCombatantMap = new Map<number, Combatant>([
    [TRAVELER_CHARACTER_ID, wearer],
    [OTHER_CHARACTER_ID, other],
  ]);
  const kitEffectState: KitEffectState = { effects: [] };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const context = createKitTestContext(wearer, {
    characterIdCombatantMap,
    kitEffectState,
    party: createParty(characterIds),
  });
  // A hit the striker lands on the enemy, which triggers the given reactions on it
  const trigger = (striker: Combatant, reactionTypes: ReactionType[]) =>
    emitKitEvent(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: reactionTypes.map((reactionType) => ({ reactionType })),
        striker,
      },
      context,
    );
  // The DMG Bonus the whole deployed team's hooks add to a reaction the given member makes
  const reactionDamageBonus = (combatant: Combatant, reactionType: ReactionType) =>
    getDeployedReactionBonuses({ combatant, element: undefined, enemy, reactionType }, context).damageBonus;
  // The ATK% buffs the set gives the wearer, one per source at most
  const attackBuffs = () =>
    kitEffectState.effects
      .filter((effect) => effect.kind === "buff" && effect.attribute === Attribute.AttackPercent)
      .map((effect) => (effect.kind === "buff" ? effect.amount : 0));
  return { attackBuffs, context, other, reactionDamageBonus, trigger, wearer };
};

describe(createHeartOfTheFurnaceSetModule, () => {
  test("a Stellar Swirl the wearer triggers gives it 12% ATK for twelve seconds", () => {
    expect.hasAssertions();

    const { attackBuffs, context, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);
    expect(attackBuffs()).toStrictEqual([expect.closeTo(0.12)]);

    stepKitSeconds(context, 11);
    expect(attackBuffs()).toStrictEqual([expect.closeTo(0.12)]);

    stepKitSeconds(context, 1);
    expect(attackBuffs()).toStrictEqual([]);
  });

  test("while it lasts, every party member's Stellar Swirl DMG is raised by 50%, and its other reactions are not", () => {
    expect.hasAssertions();

    const { context, other, reactionDamageBonus, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);

    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);
    expect(reactionDamageBonus(other, TransformativeReactionType.Overloaded)).toBe(0);

    stepKitSeconds(context, 11);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);

    stepKitSeconds(context, 1);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBe(0);
  });

  test("a Stellar Swirl another member triggers gives the wearer nothing", () => {
    expect.hasAssertions();

    const { attackBuffs, other, reactionDamageBonus, trigger } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);

    trigger(other, [StellarReactionType.StellarSwirl]);

    expect(attackBuffs()).toStrictEqual([]);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBe(0);
  });

  test("the wearer's Stellar Swirl gives both effects while it is off the field", () => {
    expect.hasAssertions();

    const { attackBuffs, other, reactionDamageBonus, trigger, wearer } = createTeam([
      OTHER_CHARACTER_ID,
      TRAVELER_CHARACTER_ID,
    ]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);

    expect(attackBuffs()).toStrictEqual([expect.closeTo(0.12)]);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);
  });

  test("another Stellar Swirl the wearer triggers restarts the twelve seconds", () => {
    expect.hasAssertions();

    const { attackBuffs, context, reactionDamageBonus, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);
    stepKitSeconds(context, 11);
    trigger(wearer, [StellarReactionType.StellarSwirl]);
    stepKitSeconds(context, 11);

    expect(attackBuffs()).toStrictEqual([expect.closeTo(0.12)]);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);

    stepKitSeconds(context, 1);
    expect(attackBuffs()).toStrictEqual([]);
  });
});
