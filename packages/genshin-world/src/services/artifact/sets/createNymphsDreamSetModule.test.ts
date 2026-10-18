import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NYMPHS_DREAM_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createNymphsDreamSetModule } from "#src/services/artifact/sets/createNymphsDreamSetModule";
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
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(NYMPHS_DREAM_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
const createWearer = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: getPassiveKit(KIT, [createNymphsDreamSetModule(bonusOf(4))]),
  level: 1,
});
// An enemy the given combatant's attack of the given kind hits, as the kit sends it
const hitEnemy = (striker: Combatant, attackTag: AttackTag, context: ReturnType<typeof createKitTestContext>) =>
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
// The ATK and Hydro DMG shares the wearer's kit adds as it stands
const getBonuses = (wearer: Combatant, kitEffectState: KitEffectState) => {
  const bonuses = wearer.kit.getPassiveBonuses?.(wearer, 1, [], kitEffectState.effects) ?? [];
  const sumOf = (attribute: Attribute) =>
    bonuses.filter((bonus) => bonus.attribute === attribute).reduce((sum, bonus) => sum + bonus.amount, 0);
  return { attack: sumOf(Attribute.AttackPercent), hydro: sumOf(Attribute.HydroDamageBonus) };
};

describe(createNymphsDreamSetModule, () => {
  test("each hit the wearer's attack lands on an enemy adds a stack, and one, two and three or more stacks raise ATK and Hydro DMG by their tier", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.NormalAttack, context);
    expect(getBonuses(wearer, kitEffectState)).toEqual({ attack: expect.closeTo(0.07), hydro: expect.closeTo(0.04) });

    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    expect(getBonuses(wearer, kitEffectState)).toEqual({ attack: expect.closeTo(0.16), hydro: expect.closeTo(0.09) });

    hitEnemy(wearer, AttackTag.ElementalBurst, context);
    expect(getBonuses(wearer, kitEffectState)).toEqual({ attack: expect.closeTo(0.25), hydro: expect.closeTo(0.15) });

    hitEnemy(wearer, AttackTag.ChargedAttack, context);
    expect(getBonuses(wearer, kitEffectState)).toEqual({ attack: expect.closeTo(0.25), hydro: expect.closeTo(0.15) });
  });

  test("a later hit of a kind refreshes its stack's eight seconds, and two hits of one kind count as one stack", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.NormalAttack, context);
    stepKitSeconds(context, 4);
    hitEnemy(wearer, AttackTag.NormalAttack, context);
    expect(getBonuses(wearer, kitEffectState).attack).toBeCloseTo(0.07);

    stepKitSeconds(context, 4.1);
    expect(getBonuses(wearer, kitEffectState).attack).toBeCloseTo(0.07);

    stepKitSeconds(context, 4);
    expect(getBonuses(wearer, kitEffectState).attack).toBe(0);
  });

  test("a hit the wearer strikes while another character stands on the field adds no stack", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      kitEffectState,
      party: createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });

    hitEnemy(wearer, AttackTag.NormalAttack, context);
    expect(getBonuses(wearer, kitEffectState)).toEqual({ attack: 0, hydro: 0 });
  });

  test("a hit another character strikes adds no stack", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });

    hitEnemy({ ...wearer, characterId: OTHER_CHARACTER_ID }, AttackTag.NormalAttack, context);
    expect(getBonuses(wearer, kitEffectState)).toEqual({ attack: 0, hydro: 0 });
  });
});
