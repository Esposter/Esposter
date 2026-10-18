import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { VOURUKASHAS_GLOW_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createVourukashasGlowSetModule } from "#src/services/artifact/sets/createVourukashasGlowSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(VOURUKASHAS_GLOW_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
const wearer: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KIT,
  level: 1,
};
const createStrike = (attackTag: AttackTag, combatant: Combatant = wearer): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant,
  hit: KIT.plungeCollision,
});
// The wearer's share of DMG a strike of the given kind gets, as its kit's module and the effects stand
const getDamageBonus = (
  module: ReturnType<typeof createVourukashasGlowSetModule>,
  attackTag: AttackTag,
  kitEffectState: KitEffectState,
  combatant: Combatant = wearer,
) => module.getStrikeDamageBonus?.(createStrike(attackTag, combatant), enemy, [], kitEffectState.effects) ?? 0;
// The wearer's HP lost to an enemy's strike of the given share, as the party records it
const takeEnemyHit = (
  module: ReturnType<typeof createVourukashasGlowSetModule>,
  context: KitContext,
  healthShare = -0.1,
) =>
  module.onKitEvent?.(
    {
      bondOfLifeShare: 0,
      characterId: TRAVELER_CHARACTER_ID,
      healthShare,
      kind: KitEventKind.HealthChanged,
      overflowHealthShare: 0,
    },
    context,
    wearer,
  );

describe(createVourukashasGlowSetModule, () => {
  test("the wearer's Elemental Skill and Elemental Burst hits gain 10% DMG, and no other hit does", () => {
    expect.hasAssertions();

    const module = createVourukashasGlowSetModule(bonusOf(4));
    const kitEffectState: KitEffectState = { effects: [] };

    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.1);
    expect(getDamageBonus(module, AttackTag.ElementalBurst, kitEffectState)).toBeCloseTo(0.1);
    expect(getDamageBonus(module, AttackTag.NormalAttack, kitEffectState)).toBe(0);
    expect(getDamageBonus(module, AttackTag.ChargedAttack, kitEffectState)).toBe(0);
  });

  test("each enemy hit the wearer takes adds a stack of 8% DMG to its Elemental Skill and Burst for five seconds, up to five", () => {
    expect.hasAssertions();

    const module = createVourukashasGlowSetModule(bonusOf(4));
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    takeEnemyHit(module, context);
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.18);

    stepKitSeconds(context, 3);
    takeEnemyHit(module, context);
    expect(getDamageBonus(module, AttackTag.ElementalBurst, kitEffectState)).toBeCloseTo(0.26);

    stepKitSeconds(context, 2.5);
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.18);

    stepKitSeconds(context, 2.6);
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.1);
  });

  test("a sixth stack replaces the one that runs out first, so the stacks stay at five", () => {
    expect.hasAssertions();

    const module = createVourukashasGlowSetModule(bonusOf(4));
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    for (let hit = 0; hit < 5; hit++) {
      takeEnemyHit(module, context);
      if (hit < 4) stepKitSeconds(context, 1);
    }
    stepKitSeconds(context, 0.5);
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.5);

    takeEnemyHit(module, context);
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.5);

    stepKitSeconds(context, 1);
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.5);

    stepKitSeconds(context, 1);
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.42);
  });

  test("a heal, a drain the wearer's own kit made, and another character's HP adds no stack", () => {
    expect.hasAssertions();

    const module = createVourukashasGlowSetModule(bonusOf(4));
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    takeEnemyHit(module, context, 0.2);
    module.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: -0.1,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
        sourceCharacterId: TRAVELER_CHARACTER_ID,
      },
      context,
      wearer,
    );
    module.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: 2,
        healthShare: -0.1,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      wearer,
    );
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.1);
  });

  test("a stack only raises the Elemental Skill and Burst of the wearer that gained it", () => {
    expect.hasAssertions();

    const module = createVourukashasGlowSetModule(bonusOf(4));
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    takeEnemyHit(module, context);
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState, { ...wearer, characterId: 2 })).toBeCloseTo(
      0.1,
    );
  });
});
