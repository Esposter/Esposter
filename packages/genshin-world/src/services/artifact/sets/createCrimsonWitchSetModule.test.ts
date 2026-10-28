import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { CRIMSON_WITCH_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createCrimsonWitchSetModule } from "#src/services/artifact/sets/createCrimsonWitchSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { getBuffAmounts } from "#src/services/artifact/sets/getBuffAmounts.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
// The wearer, who wears four pieces, and another member, in the party order given. The wearer's kit hears the events the team
// Sends, and reads the reactions a member makes in the party's hooks
const createTeam = (characterIds: number[]) => {
  const wearer = createKitCombatant(
    TRAVELER_CHARACTER_ID,
    getPassiveKit(KIT, [
      createCrimsonWitchSetModule(getArtifactSetBonus(statTables, CRIMSON_WITCH_ARTIFACT_SET_ID, 4)),
    ]),
  );
  const other = createKitCombatant(OTHER_CHARACTER_ID, KIT);
  const kitEffectState: KitEffectState = { effects: [] };
  const party = createParty(characterIds);
  const characterIdCombatantMap = new Map([
    [OTHER_CHARACTER_ID, other],
    [TRAVELER_CHARACTER_ID, wearer],
  ]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const context = createKitTestContext(wearer, { characterIdCombatantMap, kitEffectState, party });
  // The DMG Bonus the wearer's kit adds to a reaction the given member makes, as the party's hook reads it
  const reactionDamageBonus = (combatant: Combatant, reactionType: ReactionType) =>
    wearer.kit.getPartyReactionBonus?.(wearer, { combatant, element: undefined, enemy, reactionType }, context)
      ?.damageBonus ?? 0;
  // The member uses its Elemental Skill, as the team's events send it
  const useSkill = (characterId: number) => {
    emitKitEvent({ characterId, kind: KitEventKind.SkillUsed }, context);
  };
  return { context, other, reactionDamageBonus, useSkill, wearer };
};

describe(createCrimsonWitchSetModule, () => {
  test("the wearer's own Overloaded, Burning and Burgeon DMG is raised by 40%, and another member's is not", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    for (const reactionType of [
      TransformativeReactionType.Overloaded,
      TransformativeReactionType.Burning,
      TransformativeReactionType.Burgeon,
    ]) {
      expect(reactionDamageBonus(wearer, reactionType)).toBeCloseTo(0.4);
      expect(reactionDamageBonus(other, reactionType)).toBe(0);
    }
  });

  test("the wearer's own Vaporize and Melt DMG is raised by 15%, and a Swirl is raised by neither", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    for (const reactionType of [AmplifyingReactionType.Vaporize, AmplifyingReactionType.Melt]) {
      expect(reactionDamageBonus(wearer, reactionType)).toBeCloseTo(0.15);
      expect(reactionDamageBonus(other, reactionType)).toBe(0);
    }
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Swirl)).toBe(0);
  });

  test("each Elemental Skill the active wearer uses raises its Pyro DMG Bonus by 7.5%, up to three stacks", () => {
    expect.hasAssertions();

    const { context, useSkill } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    useSkill(TRAVELER_CHARACTER_ID);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([expect.closeTo(0.075)]);

    useSkill(TRAVELER_CHARACTER_ID);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([expect.closeTo(0.15)]);

    useSkill(TRAVELER_CHARACTER_ID);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([expect.closeTo(0.225)]);

    useSkill(TRAVELER_CHARACTER_ID);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([expect.closeTo(0.225)]);
  });

  test("the stacks last ten seconds from the last skill, and a skill after they lapse starts again from one", () => {
    expect.hasAssertions();

    const { context, useSkill } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    useSkill(TRAVELER_CHARACTER_ID);
    useSkill(TRAVELER_CHARACTER_ID);
    stepKitSeconds(context, 9);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([expect.closeTo(0.15)]);

    stepKitSeconds(context, 1);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([]);

    useSkill(TRAVELER_CHARACTER_ID);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([expect.closeTo(0.075)]);
  });

  test("a skill another member uses, or the wearer's while off the field, adds no stack", () => {
    expect.hasAssertions();

    const { context, useSkill } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);

    useSkill(TRAVELER_CHARACTER_ID);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([]);

    useSkill(OTHER_CHARACTER_ID);
    expect(getBuffAmounts(context.kitEffectState, Attribute.PyroDamageBonus)).toStrictEqual([]);
  });
});
