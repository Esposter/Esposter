import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { FLOWER_OF_PARADISE_LOST_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createFlowerOfParadiseLostSetModule } from "#src/services/artifact/sets/createFlowerOfParadiseLostSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const createCombatant = (characterId: number, kit = KIT): Combatant => {
  const attributes = computeCharacterAttributes([]);
  return { ascension: 0, attributes, characterId, constellationCount: 0, elementalResonances: [], kit, level: 1 };
};
// The wearer, who wears four pieces, and another member, in the party order given.
// The wearer's kit hears the events the team sends, and reads the reactions a member makes in the party's hooks
const createTeam = (characterIds: number[]) => {
  const wearer = createCombatant(
    TRAVELER_CHARACTER_ID,
    getPassiveKit(KIT, [
      createFlowerOfParadiseLostSetModule(getArtifactSetBonus(statTables, FLOWER_OF_PARADISE_LOST_ARTIFACT_SET_ID, 4)),
    ]),
  );
  const other = createCombatant(OTHER_CHARACTER_ID);
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
  // A hit the striker lands on the enemy, which triggers the given reactions on it, as a gadget's if it is one
  const trigger = (striker: Combatant, reactionTypes: ReactionType[], isGadget?: true) =>
    emitKitEvent(
      {
        enemy,
        isGadget,
        kind: KitEventKind.ReactionTriggered,
        reactions: reactionTypes.map((reactionType) => ({ reactionType })),
        striker,
      },
      context,
    );
  return { context, other, reactionDamageBonus, trigger, wearer };
};

const BLOOM_TYPE_REACTION_TYPES: ReactionType[] = [
  TransformativeReactionType.Bloom,
  TransformativeReactionType.Hyperbloom,
  TransformativeReactionType.Burgeon,
];

describe(createFlowerOfParadiseLostSetModule, () => {
  test("the wearer's own Bloom, Hyperbloom and Burgeon DMG is raised by 40%, and its Lunar-Bloom DMG by 10%, while another member's is not", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    for (const reactionType of BLOOM_TYPE_REACTION_TYPES) {
      expect(reactionDamageBonus(wearer, reactionType)).toBeCloseTo(0.4);
      expect(reactionDamageBonus(other, reactionType)).toBe(0);
    }
    expect(reactionDamageBonus(wearer, LunarReactionType.LunarBloom)).toBeCloseTo(0.1);
    expect(reactionDamageBonus(other, LunarReactionType.LunarBloom)).toBe(0);
  });

  test("each Bloom-type or Lunar-Bloom reaction the wearer triggers adds a stack, up to four, raising its own DMG by 10% of Bloom and 2.5% of Lunar-Bloom a stack", () => {
    expect.hasAssertions();

    const { context, reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    for (const stacks of [1, 2, 3, 4, 4]) {
      trigger(wearer, [TransformativeReactionType.Hyperbloom]);
      expect(reactionDamageBonus(wearer, TransformativeReactionType.Hyperbloom)).toBeCloseTo(0.4 + 0.1 * stacks);
      stepKitSeconds(context, 1);
    }
    expect(reactionDamageBonus(wearer, LunarReactionType.LunarBloom)).toBeCloseTo(0.1 + 0.025 * 4);
  });

  test("a stack lasts ten seconds from the last one gained, and the count starts again from one after they lapse", () => {
    expect.hasAssertions();

    const { context, reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const burgeonBonus = () => reactionDamageBonus(wearer, TransformativeReactionType.Burgeon);

    trigger(wearer, [TransformativeReactionType.Burgeon]);
    stepKitSeconds(context, 1);
    trigger(wearer, [TransformativeReactionType.Burgeon]);
    expect(burgeonBonus()).toBeCloseTo(0.6);

    stepKitSeconds(context, 9);
    expect(burgeonBonus()).toBeCloseTo(0.6);

    stepKitSeconds(context, 1);
    expect(burgeonBonus()).toBeCloseTo(0.4);

    trigger(wearer, [TransformativeReactionType.Burgeon]);
    expect(burgeonBonus()).toBeCloseTo(0.5);
  });

  test("a reaction the wearer triggers within a second of its last stack gives none", () => {
    expect.hasAssertions();

    const { reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [TransformativeReactionType.Bloom]);
    trigger(wearer, [TransformativeReactionType.Bloom]);

    expect(reactionDamageBonus(wearer, TransformativeReactionType.Bloom)).toBeCloseTo(0.5);
  });

  test("a Bloom a gadget of the wearer's triggers gives no stack, while a Hyperbloom it triggers does", () => {
    expect.hasAssertions();

    const { reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [TransformativeReactionType.Bloom], true);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Bloom)).toBeCloseTo(0.4);

    trigger(wearer, [TransformativeReactionType.Hyperbloom], true);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Hyperbloom)).toBeCloseTo(0.5);
  });

  test("a reaction another member triggers gives the wearer no stack, while one the wearer triggers counts off the field", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, trigger, wearer } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);

    trigger(other, [TransformativeReactionType.Hyperbloom]);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Hyperbloom)).toBeCloseTo(0.4);

    trigger(wearer, [TransformativeReactionType.Hyperbloom]);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Hyperbloom)).toBeCloseTo(0.5);
  });
});
