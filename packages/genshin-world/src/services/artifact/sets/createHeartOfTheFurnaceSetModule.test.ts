import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { HEART_OF_THE_FURNACE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createHeartOfTheFurnaceSetModule } from "#src/services/artifact/sets/createHeartOfTheFurnaceSetModule";
import { createReactionTrigger } from "#src/services/artifact/sets/createReactionTrigger.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { getBuffAmounts } from "#src/services/weapon/passives/getBuffAmounts.test";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
describe(createHeartOfTheFurnaceSetModule, () => {
  const THIRD_CHARACTER_ID = 3;
  const WEARER_KIT = getPassiveKit(KIT, [
    createHeartOfTheFurnaceSetModule(getArtifactSetBonus(statTables, HEART_OF_THE_FURNACE_ARTIFACT_SET_ID, 4)),
  ]);
  // The traveller and two other members, the given ones wearing four pieces, with the party in the order given
  const createTeam = (characterIds: number[], wearerIds: number[] = [TRAVELER_CHARACTER_ID]) => {
    const createMember = (characterId: number) =>
      createKitCombatant(characterId, wearerIds.includes(characterId) ? WEARER_KIT : KIT);
    const wearer = createMember(TRAVELER_CHARACTER_ID);
    const other = createMember(OTHER_CHARACTER_ID);
    const secondWearer = createMember(THIRD_CHARACTER_ID);
    const characterIdCombatantMap = new Map<number, Combatant>([
      [OTHER_CHARACTER_ID, other],
      [THIRD_CHARACTER_ID, secondWearer],
      [TRAVELER_CHARACTER_ID, wearer],
    ]);
    const kitEffectState: KitEffectState = { effects: [] };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty(characterIds),
    });
    const trigger = createReactionTrigger(enemy, context);
    // The DMG Bonus the whole deployed team's hooks add to a reaction the given member makes
    const reactionDamageBonus = (combatant: Combatant, reactionType: ReactionType) =>
      getDeployedReactionBonuses({ combatant, element: undefined, enemy, reactionType }, context).damageBonus;
    return { context, other, reactionDamageBonus, secondWearer, trigger, wearer };
  };

  test("a Stellar Swirl the wearer triggers gives it 12% ATK for twelve seconds", () => {
    expect.hasAssertions();

    const { context, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);
    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([expect.closeTo(0.12)]);

    stepKitSeconds(context, 11);
    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([expect.closeTo(0.12)]);

    stepKitSeconds(context, 1);
    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([]);
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

  test("a Stellar-Conduct the wearer triggers gives it 12% ATK for twelve seconds", () => {
    expect.hasAssertions();

    const { context, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [StellarReactionType.StellarConduct]);
    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([expect.closeTo(0.12)]);

    stepKitSeconds(context, 11);
    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([expect.closeTo(0.12)]);

    stepKitSeconds(context, 1);
    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([]);
  });

  test("every party member's Stellar-Conduct DMG is raised by 50% while it holds", () => {
    expect.hasAssertions();

    const { context, other, reactionDamageBonus, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);

    trigger(wearer, [StellarReactionType.StellarConduct]);

    expect(reactionDamageBonus(other, StellarReactionType.StellarConduct)).toBeCloseTo(0.5);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarConduct)).toBeCloseTo(0.5);

    stepKitSeconds(context, 11);
    expect(reactionDamageBonus(other, StellarReactionType.StellarConduct)).toBeCloseTo(0.5);

    stepKitSeconds(context, 1);
    expect(reactionDamageBonus(other, StellarReactionType.StellarConduct)).toBe(0);
  });

  test("a Stellar Swirl another member triggers gives the wearer nothing", () => {
    expect.hasAssertions();

    const { context, other, reactionDamageBonus, trigger } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(other, [StellarReactionType.StellarSwirl]);

    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([]);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBe(0);
  });

  test("the wearer's Stellar Swirl gives both effects while it is off the field", () => {
    expect.hasAssertions();

    const { context, other, reactionDamageBonus, trigger, wearer } = createTeam([
      OTHER_CHARACTER_ID,
      TRAVELER_CHARACTER_ID,
    ]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);

    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([expect.closeTo(0.12)]);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);
  });

  test("another Stellar Swirl the wearer triggers restarts the twelve seconds", () => {
    expect.hasAssertions();

    const { context, reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);
    stepKitSeconds(context, 11);
    trigger(wearer, [StellarReactionType.StellarSwirl]);
    stepKitSeconds(context, 11);

    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([expect.closeTo(0.12)]);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);

    stepKitSeconds(context, 1);
    expect(getBuffAmounts(context.kitEffectState, Attribute.AttackPercent)).toStrictEqual([]);
  });

  test("two wearers of the set give the party one 50% bonus between them, not one each", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, secondWearer, trigger, wearer } = createTeam(
      [TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, THIRD_CHARACTER_ID],
      [TRAVELER_CHARACTER_ID, THIRD_CHARACTER_ID],
    );

    trigger(wearer, [StellarReactionType.StellarSwirl]);
    trigger(secondWearer, [StellarReactionType.StellarSwirl]);

    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);
  });

  test("the party's 50% passes to the wearer whose Stellar Swirl still runs once the first one lapses", () => {
    expect.hasAssertions();

    const { context, other, reactionDamageBonus, secondWearer, trigger, wearer } = createTeam(
      [TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, THIRD_CHARACTER_ID],
      [TRAVELER_CHARACTER_ID, THIRD_CHARACTER_ID],
    );

    trigger(wearer, [StellarReactionType.StellarSwirl]);
    stepKitSeconds(context, 6);
    trigger(secondWearer, [StellarReactionType.StellarSwirl]);

    stepKitSeconds(context, 6);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);

    stepKitSeconds(context, 5);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBeCloseTo(0.5);

    stepKitSeconds(context, 1);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBe(0);
  });
});
