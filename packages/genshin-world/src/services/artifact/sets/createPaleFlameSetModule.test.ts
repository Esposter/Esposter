import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { PALE_FLAME_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createPaleFlameSetModule } from "#src/services/artifact/sets/createPaleFlameSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
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
const createWearer = (): Combatant => ({
  ...createKitCombatant(TRAVELER_CHARACTER_ID, KIT),
  kit: getPassiveKit(KIT, [createPaleFlameSetModule(getArtifactSetBonus(statTables, PALE_FLAME_ARTIFACT_SET_ID, 4))]),
});
// The ATK and Physical DMG shares the wearer's kit adds as it stands
const getBonuses = (wearer: Combatant, kitEffectState: KitEffectState) => {
  const bonuses = wearer.kit.getPassiveBonuses?.(wearer, 1, [], kitEffectState.effects) ?? [];
  const sumOf = (attribute: Attribute) =>
    bonuses.filter((bonus) => bonus.attribute === attribute).reduce((sum, bonus) => sum + bonus.amount, 0);
  return { attack: sumOf(Attribute.AttackPercent), physical: sumOf(Attribute.PhysicalDamageBonus) };
};

describe(createPaleFlameSetModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  // An enemy the given combatant's attack of the given kind hits, as the kit sends it
  const hitEnemy = (striker: Combatant, attackTag: AttackTag, context: ReturnType<typeof createKitTestContext>) => {
    emitKitEvent(
      {
        attackTag,
        enemy,
        hit: KIT.plungeCollision,
        isCritical: false,
        isDefeated: false,
        kind: KitEventKind.DamageTaken,
        striker,
      },
      context,
    );
  };

  test("each Elemental Skill hit the wearer lands adds a stack of 9% ATK, two at most, and two stacks add 25% Physical DMG", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    expect(getBonuses(wearer, kitEffectState)).toStrictEqual({ attack: expect.closeTo(0.09), physical: 0 });

    stepKitSeconds(context, 0.35);
    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    expect(getBonuses(wearer, kitEffectState)).toStrictEqual({
      attack: expect.closeTo(0.18),
      physical: expect.closeTo(0.25),
    });

    stepKitSeconds(context, 0.35);
    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    expect(getBonuses(wearer, kitEffectState)).toStrictEqual({
      attack: expect.closeTo(0.18),
      physical: expect.closeTo(0.25),
    });
  });

  test("a hit inside 0.3 seconds of the last stack gained adds none", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    expect(getBonuses(wearer, kitEffectState).attack).toBeCloseTo(0.09);

    stepKitSeconds(context, 0.35);
    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    expect(getBonuses(wearer, kitEffectState).attack).toBeCloseTo(0.18);
  });

  test("the stacks last seven seconds from the latest stack gained, and all end together", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    stepKitSeconds(context, 1);
    hitEnemy(wearer, AttackTag.ElementalSkill, context);

    stepKitSeconds(context, 6.9);
    expect(getBonuses(wearer, kitEffectState)).toStrictEqual({
      attack: expect.closeTo(0.18),
      physical: expect.closeTo(0.25),
    });

    stepKitSeconds(context, 0.2);
    expect(getBonuses(wearer, kitEffectState)).toStrictEqual({ attack: 0, physical: 0 });
  });

  test("a hit after the stacks run out starts again from one stack", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    stepKitSeconds(context, 1);
    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    stepKitSeconds(context, 7.1);
    expect(getBonuses(wearer, kitEffectState).attack).toBe(0);

    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    expect(getBonuses(wearer, kitEffectState)).toStrictEqual({ attack: expect.closeTo(0.09), physical: 0 });
  });

  test("only the wearer's Elemental Skill hits count, and only while the wearer stands on the field", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const otherWearer: Combatant = { ...wearer, characterId: OTHER_CHARACTER_ID };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });

    hitEnemy(wearer, AttackTag.NormalAttack, context);
    hitEnemy(wearer, AttackTag.ElementalBurst, context);
    hitEnemy(otherWearer, AttackTag.ElementalSkill, context);
    expect(getBonuses(wearer, kitEffectState).attack).toBe(0);

    const benchState: KitEffectState = { effects: [] };
    const benchContext = createKitTestContext(wearer, {
      kitEffectState: benchState,
      party: createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });
    hitEnemy(wearer, AttackTag.ElementalSkill, benchContext);
    expect(getBonuses(wearer, benchState).attack).toBe(0);
  });
});
