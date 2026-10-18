import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { DISENCHANTMENT_IN_DEEP_SHADOW_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createDisenchantmentInDeepShadowSetModule } from "#src/services/artifact/sets/createDisenchantmentInDeepShadowSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { addSuperconductStatus } from "#src/services/enemy/addSuperconductStatus";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
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
    .get(DISENCHANTMENT_IN_DEEP_SHADOW_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
const createCombatant = (characterId: number, kit = KIT): Combatant => {
  const attributes = computeCharacterAttributes([]);
  return { ascension: 0, attributes, characterId, constellationCount: 0, elementalResonances: [], kit, level: 1 };
};

describe(createDisenchantmentInDeepShadowSetModule, () => {
  test("the wearer's own Superconduct reaction DMG is raised by 80%, and another member's is not", () => {
    expect.hasAssertions();

    const wearer = createCombatant(
      TRAVELER_CHARACTER_ID,
      getPassiveKit(KIT, [createDisenchantmentInDeepShadowSetModule(bonusOf(4))]),
    );
    const other = createCombatant(OTHER_CHARACTER_ID);
    const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, wearer],
        [OTHER_CHARACTER_ID, other],
      ]),
      party,
    });
    const reactionType = TransformativeReactionType.Superconduct;

    expect(
      wearer.kit.getPartyReactionBonus?.(wearer, { combatant: wearer, reactionType }, context)?.damageBonus,
    ).toBeCloseTo(0.8);
    expect(
      wearer.kit.getPartyReactionBonus?.(wearer, { combatant: other, reactionType }, context)?.damageBonus ?? 0,
    ).toBe(0);
  });

  test("the wearer's attacks on an enemy under Superconduct gain 16% CRIT Rate, and on any other enemy gain none", () => {
    expect.hasAssertions();

    const wearer = createCombatant(
      TRAVELER_CHARACTER_ID,
      getPassiveKit(KIT, [createDisenchantmentInDeepShadowSetModule(bonusOf(4))]),
    );
    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const strike: KitStrike = {
      attackTag: AttackTag.NormalAttack,
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: wearer,
      hit: KIT.plungeCollision,
    };
    const plainEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const superconductedEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    addSuperconductStatus(superconductedEnemy);

    expect(wearer.kit.getStrikeCriticalRateBonus?.(strike, plainEnemy, party, kitEffectState.effects)).toBe(0);
    expect(
      wearer.kit.getStrikeCriticalRateBonus?.(strike, superconductedEnemy, party, kitEffectState.effects),
    ).toBeCloseTo(0.16);
  });
});
