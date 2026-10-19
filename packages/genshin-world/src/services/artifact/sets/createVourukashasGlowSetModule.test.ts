import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PartyHealthChange } from "#src/models/party/PartyHealthChange";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { VOURUKASHAS_GLOW_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createVourukashasGlowSetModule } from "#src/services/artifact/sets/createVourukashasGlowSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createVourukashasGlowSetModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wearer = createKitCombatant(TRAVELER_CHARACTER_ID, KIT);
  // The wearer's share of DMG a strike of the given kind gets, as its kit's module and the effects stand
  const getDamageBonus = (
    module: ReturnType<typeof createVourukashasGlowSetModule>,
    attackTag: AttackTag,
    kitEffectState: KitEffectState,
    combatant: Combatant = wearer,
  ) =>
    module.getStrikeDamageBonus?.(
      createKitStrike(combatant, attackTag),
      enemy,
      createParty([TRAVELER_CHARACTER_ID]),
      kitEffectState.effects,
    ) ?? 0;
  // The wearer's HP lost to an enemy's strike of the given share, as the party records it, its fields set by overrides
  const takeEnemyHit = (
    module: ReturnType<typeof createVourukashasGlowSetModule>,
    context: KitContext,
    healthShare = -0.1,
    overrides: Partial<PartyHealthChange> = {},
  ) =>
    module.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
        ...overrides,
      },
      context,
      wearer,
    );

  test("the wearer's Elemental Skill and Elemental Burst hits gain 10% DMG, and no other hit does", () => {
    expect.hasAssertions();

    const module = createVourukashasGlowSetModule(getArtifactSetBonus(statTables, VOURUKASHAS_GLOW_ARTIFACT_SET_ID, 4));
    const kitEffectState: KitEffectState = { effects: [] };

    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.1);
    expect(getDamageBonus(module, AttackTag.ElementalBurst, kitEffectState)).toBeCloseTo(0.1);
    expect(getDamageBonus(module, AttackTag.NormalAttack, kitEffectState)).toBe(0);
    expect(getDamageBonus(module, AttackTag.ChargedAttack, kitEffectState)).toBe(0);
  });

  test("each enemy hit the wearer takes adds a stack of 8% DMG to its Elemental Skill and Burst for five seconds, up to five", () => {
    expect.hasAssertions();

    const module = createVourukashasGlowSetModule(getArtifactSetBonus(statTables, VOURUKASHAS_GLOW_ARTIFACT_SET_ID, 4));
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

    const module = createVourukashasGlowSetModule(getArtifactSetBonus(statTables, VOURUKASHAS_GLOW_ARTIFACT_SET_ID, 4));
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

    const module = createVourukashasGlowSetModule(getArtifactSetBonus(statTables, VOURUKASHAS_GLOW_ARTIFACT_SET_ID, 4));
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    takeEnemyHit(module, context, 0.2);
    takeEnemyHit(module, context, -0.1, { sourceCharacterId: TRAVELER_CHARACTER_ID });
    takeEnemyHit(module, context, -0.1, { characterId: OTHER_CHARACTER_ID });
    expect(getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState)).toBeCloseTo(0.1);
  });

  test("a stack only raises the Elemental Skill and Burst of the wearer that gained it", () => {
    expect.hasAssertions();

    const module = createVourukashasGlowSetModule(getArtifactSetBonus(statTables, VOURUKASHAS_GLOW_ARTIFACT_SET_ID, 4));
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    takeEnemyHit(module, context);
    expect(
      getDamageBonus(module, AttackTag.ElementalSkill, kitEffectState, { ...wearer, characterId: OTHER_CHARACTER_ID }),
    ).toBeCloseTo(0.1);
  });
});
