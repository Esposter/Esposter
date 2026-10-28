import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHT_OF_THE_SKYS_UNVEILING_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createNightOfTheSkysUnveilingSetModule } from "#src/services/artifact/sets/createNightOfTheSkysUnveilingSetModule";
import { createReactionTrigger } from "#src/services/artifact/sets/createReactionTrigger.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { getBuffAmounts } from "#src/services/artifact/sets/getBuffAmounts.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID, THIRD_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
// A wearer of four pieces with a kit holding the set's four-piece, the rest of the characters in the map, and the party in the
// Order given. The characters given in benedictedIds carry a Moonsign benediction, which sets the team's Moonsign level
const createWearer = (characterId = TRAVELER_CHARACTER_ID) =>
  createKitCombatant(
    characterId,
    getPassiveKit(KIT, [
      createNightOfTheSkysUnveilingSetModule(
        getArtifactSetBonus(statTables, NIGHT_OF_THE_SKYS_UNVEILING_ARTIFACT_SET_ID, 4),
      ),
    ]),
  );
describe(createNightOfTheSkysUnveilingSetModule, () => {
  const FOURTH_CHARACTER_ID = 4;
  // A Moonsign character's kit, which counts toward the team's Moonsign level
  const MOONSIGN_KIT: Kit = { ...KIT, moonsignBenediction: { lunarReactionTypes: [] } };

  const createTeam = (characterIds: number[], benedictedIds: number[] = []) => {
    const wearer = createWearer();
    const characterIdCombatantMap = new Map<number, Combatant>([[TRAVELER_CHARACTER_ID, wearer]]);
    const createMember = (characterId: number) =>
      createKitCombatant(characterId, benedictedIds.includes(characterId) ? MOONSIGN_KIT : KIT);
    const other = createMember(OTHER_CHARACTER_ID);
    characterIdCombatantMap.set(OTHER_CHARACTER_ID, other);
    for (const characterId of [THIRD_CHARACTER_ID, FOURTH_CHARACTER_ID])
      characterIdCombatantMap.set(characterId, createMember(characterId));
    const kitEffectState: KitEffectState = { effects: [] };
    const party = createParty(characterIds);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(wearer, { characterIdCombatantMap, kitEffectState, party });
    // The DMG Bonus the whole deployed team's hooks add to a reaction the given member makes
    const teamReactionDamageBonus = (combatant: Combatant, reactionType: ReactionType) =>
      getDeployedReactionBonuses({ combatant, element: undefined, enemy, reactionType }, context).damageBonus;
    const trigger = createReactionTrigger(enemy, context);
    return { context, other, teamReactionDamageBonus, trigger, wearer };
  };

  test("a Lunar Reaction the team triggers while the wearer is on the field gives it 15% CRIT Rate for four seconds at Nascent Gleam", () => {
    expect.hasAssertions();

    const { context, other, trigger } = createTeam(
      [TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, THIRD_CHARACTER_ID],
      [THIRD_CHARACTER_ID],
    );

    trigger(other, [LunarReactionType.LunarCharged]);
    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([expect.closeTo(0.15)]);

    stepKitSeconds(context, 3);
    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([expect.closeTo(0.15)]);

    stepKitSeconds(context, 1);
    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([]);
  });

  test("the same Lunar Reaction gives 30% CRIT Rate at Ascendant Gleam", () => {
    expect.hasAssertions();

    const { context, other, trigger } = createTeam(
      [TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, THIRD_CHARACTER_ID, FOURTH_CHARACTER_ID],
      [THIRD_CHARACTER_ID, FOURTH_CHARACTER_ID],
    );

    trigger(other, [LunarReactionType.LunarBloom]);

    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([expect.closeTo(0.3)]);
  });

  test("a Lunar Reaction gives the wearer nothing while it is off the field", () => {
    expect.hasAssertions();

    const { context, other, teamReactionDamageBonus, trigger } = createTeam(
      [OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID, THIRD_CHARACTER_ID],
      [THIRD_CHARACTER_ID],
    );

    trigger(other, [LunarReactionType.LunarCharged]);

    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([]);
    expect(teamReactionDamageBonus(other, LunarReactionType.LunarCharged)).toBe(0);
  });

  test("while the effect lasts, every party member's Lunar Reaction DMG is raised by 10%, and its other reactions are not", () => {
    expect.hasAssertions();

    const { context, other, teamReactionDamageBonus, trigger, wearer } = createTeam(
      [TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, THIRD_CHARACTER_ID],
      [THIRD_CHARACTER_ID],
    );

    trigger(other, [LunarReactionType.LunarCharged]);

    expect(teamReactionDamageBonus(other, LunarReactionType.LunarBloom)).toBeCloseTo(0.1);
    expect(teamReactionDamageBonus(wearer, LunarReactionType.LunarCrystallize)).toBeCloseTo(0.1);
    expect(teamReactionDamageBonus(other, TransformativeReactionType.Overloaded)).toBe(0);

    stepKitSeconds(context, 4);
    expect(teamReactionDamageBonus(other, LunarReactionType.LunarBloom)).toBe(0);
  });

  test("two wearers of the effect give one 10% between them, as the effects of one kind cannot stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const firstWearer = createWearer();
    const secondWearer = createWearer(THIRD_CHARACTER_ID);
    const characterIdCombatantMap = new Map<number, Combatant>([
      [THIRD_CHARACTER_ID, secondWearer],
      [TRAVELER_CHARACTER_ID, firstWearer],
    ]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const triggerWhileActive = (striker: Combatant, characterIds: number[]) => {
      emitKitEvent(
        {
          enemy,
          kind: KitEventKind.ReactionTriggered,
          reactions: [{ reactionType: LunarReactionType.LunarCharged }],
          striker,
        },
        createKitTestContext(striker, { characterIdCombatantMap, kitEffectState, party: createParty(characterIds) }),
      );
    };
    // Each wearer triggers while it is the active character, so each gains the effect
    triggerWhileActive(firstWearer, [TRAVELER_CHARACTER_ID, THIRD_CHARACTER_ID]);
    triggerWhileActive(secondWearer, [THIRD_CHARACTER_ID, TRAVELER_CHARACTER_ID]);

    const context = createKitTestContext(firstWearer, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID, THIRD_CHARACTER_ID]),
    });
    expect(
      getDeployedReactionBonuses(
        { combatant: firstWearer, element: undefined, enemy, reactionType: LunarReactionType.LunarBloom },
        context,
      ).damageBonus,
    ).toBeCloseTo(0.1);
  });
});
