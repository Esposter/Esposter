import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SCARLETPROOF_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createScarletproofSetModule } from "#src/services/artifact/sets/createScarletproofSetModule";
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
// The wearer, who wears four pieces, and another member, in the party order given. The wearer's kit hears the events the team
// Sends, and reads the reactions a member makes in the party's hooks
const createTeam = (characterIds: number[]) => {
  const wearer = createCombatant(
    TRAVELER_CHARACTER_ID,
    getPassiveKit(KIT, [createScarletproofSetModule(getArtifactSetBonus(statTables, SCARLETPROOF_ARTIFACT_SET_ID, 4))]),
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
  // A hit the striker lands on the enemy, which triggers the given reactions on it
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
  // The CRIT Rate the set's buffs give the wearer, one buff of the attribute at most
  const critRateBuffs = () =>
    kitEffectState.effects
      .filter((effect) => effect.kind === "buff" && effect.attribute === Attribute.CriticalRate)
      .map((effect) => (effect.kind === "buff" ? effect.amount : 0));
  return { context, critRateBuffs, other, reactionDamageBonus, trigger, wearer };
};

describe(createScarletproofSetModule, () => {
  test("a Stellar Swirl the wearer triggers raises its own Stellar Swirl DMG by 40% for ten seconds, and another member's is not", () => {
    expect.hasAssertions();

    const { context, other, reactionDamageBonus, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBe(0);

    trigger(wearer, [StellarReactionType.StellarSwirl]);

    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.4);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBe(0);

    stepKitSeconds(context, 9);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.4);

    stepKitSeconds(context, 1);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBe(0);
  });

  test("a Stellar Swirl the wearer triggers raises its CRIT Rate by 16% for ten seconds, restarted rather than stacked", () => {
    expect.hasAssertions();

    const { context, critRateBuffs, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);
    trigger(wearer, [StellarReactionType.StellarSwirl]);
    expect(critRateBuffs()).toStrictEqual([expect.closeTo(0.16)]);

    stepKitSeconds(context, 10);
    expect(critRateBuffs()).toStrictEqual([]);
  });

  test("a Stellar Swirl another member triggers, or a Swirl of another reaction, raises neither", () => {
    expect.hasAssertions();

    const { critRateBuffs, other, reactionDamageBonus, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);

    trigger(other, [StellarReactionType.StellarSwirl]);
    trigger(wearer, [ReactionType.Quicken]);

    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBe(0);
    expect(critRateBuffs()).toStrictEqual([]);
  });

  test("a Stellar Swirl a summon of the wearer's triggers counts as the wearer's, as gcsim's Stellar Swirl hook takes any attack of the wearer", () => {
    expect.hasAssertions();

    const { critRateBuffs, reactionDamageBonus, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);

    trigger(wearer, [StellarReactionType.StellarSwirl], true);

    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.4);
    expect(critRateBuffs()).toStrictEqual([expect.closeTo(0.16)]);
  });
});
