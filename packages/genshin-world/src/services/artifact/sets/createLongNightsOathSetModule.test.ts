import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { LONG_NIGHTS_OATH_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createLongNightsOathSetModule } from "#src/services/artifact/sets/createLongNightsOathSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
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
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: getPassiveKit(KIT, [
    createLongNightsOathSetModule(getArtifactSetBonus(statTables, LONG_NIGHTS_OATH_ARTIFACT_SET_ID, 4)),
  ]),
  level: 1,
});

describe(createLongNightsOathSetModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
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
  // The DMG Bonus a Plunging Attack of the wearer's adds as it stands, against the enemy
  const getPlungeBonus = (wearer: Combatant, kitEffectState: KitEffectState) =>
    wearer.kit.getStrikeDamageBonus?.(
      createKitStrike(wearer, AttackTag.PlungingAttack),
      enemy,
      createParty([TRAVELER_CHARACTER_ID]),
      kitEffectState.effects,
    ) ?? 0;

  test("the two-piece bonus raises Plunging Attack DMG by 25%, and no other attack's", () => {
    expect.hasAssertions();

    const wearer = {
      ...createWearer(),
      kit: getPassiveKit(KIT, [
        createLongNightsOathSetModule(getArtifactSetBonus(statTables, LONG_NIGHTS_OATH_ARTIFACT_SET_ID, 2)),
      ]),
    };
    const kitEffectState: KitEffectState = { effects: [] };

    expect(getPlungeBonus(wearer, kitEffectState)).toBeCloseTo(0.25);
    expect(
      wearer.kit.getStrikeDamageBonus?.(
        createKitStrike(wearer, AttackTag.ChargedAttack),
        enemy,
        createParty([TRAVELER_CHARACTER_ID]),
        kitEffectState.effects,
      ) ?? 0,
    ).toBe(0);
  });

  test("a Plunging Attack's hit gives one stack, and a Charged Attack's or Elemental Skill's gives two, each stack raising Plunging Attack DMG by 15%", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.PlungingAttack, context);
    expect(getPlungeBonus(wearer, kitEffectState)).toBeCloseTo(0.15);

    hitEnemy(wearer, AttackTag.ChargedAttack, context);
    expect(getPlungeBonus(wearer, kitEffectState)).toBeCloseTo(0.45);
  });

  test("each attack triggers its stacks once a second", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.PlungingAttack, context);
    hitEnemy(wearer, AttackTag.PlungingAttack, context);
    expect(getPlungeBonus(wearer, kitEffectState)).toBeCloseTo(0.15);

    stepKitSeconds(context, 1.05);
    hitEnemy(wearer, AttackTag.PlungingAttack, context);
    expect(getPlungeBonus(wearer, kitEffectState)).toBeCloseTo(0.3);
  });

  test("the stacks cap at five, and a stack past the cap replaces the one that runs out first", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    stepKitSeconds(context, 1.05);
    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    stepKitSeconds(context, 1.05);
    hitEnemy(wearer, AttackTag.ElementalSkill, context);
    expect(getPlungeBonus(wearer, kitEffectState)).toBeCloseTo(0.75);

    // The replacing stack lasts six seconds from its hit, so the other first stack is the one that runs out at six
    stepKitSeconds(context, 4.1);
    expect(getPlungeBonus(wearer, kitEffectState)).toBeCloseTo(0.6);

    stepKitSeconds(context, 1);
    expect(getPlungeBonus(wearer, kitEffectState)).toBeCloseTo(0.3);
  });

  test("a hit the wearer strikes while another character stands on the field adds no stack", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      kitEffectState,
      party: createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });

    hitEnemy(wearer, AttackTag.PlungingAttack, context);
    expect(getPlungeBonus(wearer, kitEffectState)).toBe(0);
  });
});
