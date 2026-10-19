import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { FISCHL_CHARACTER_ID } from "#src/services/kit/characters/fischlKit";
import { MONA_CHARACTER_ID } from "#src/services/kit/characters/monaKit";
import { createKitTestContext, stepKitSecondsSendingExpiries } from "#src/services/kit/createKitTestContext.test";
import { endKitSwapEffects } from "#src/services/kit/effects/endKitSwapEffects";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createDolorousStrokePassiveModule } from "#src/services/weapon/passives/createDolorousStrokePassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createDolorousStrokePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Dolorous Stroke at its first rank: an Elemental Skill gives Path of Conflict for 17 seconds, and Unforgivable and
  // Irreparable for three, once every 18; each raises its own attacks' DMG by 40%, and a hit of the other kind extends it
  // By a second while the Path holds, by 75% more in Hexerei: Secret Rite
  const passiveModule = createDolorousStrokePassiveModule([17, 3, 0.4, 0.4, 1, 0.75, 18]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: getPassiveKit(TRAVELER_KIT, [passiveModule]),
    level: 1,
  };
  const createContext = (characterIds: number[] = [TRAVELER_CHARACTER_ID]): KitContext =>
    createKitTestContext(wielder, { party: createParty(characterIds) });
  const useSkill = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
  const hitWith = (context: KitContext, attackTag: AttackTag) =>
    passiveModule.onKitEvent?.(
      { attackTag, element: undefined, enemy, kind: KitEventKind.EnemyHit, striker: wielder },
      context,
      wielder,
    );
  // The DMG Bonus a strike of the wielder's of the given kind takes from its weapon
  const priceStrike = (context: KitContext, attackTag: AttackTag): number =>
    passiveModule.getStrikeDamageBonus?.(
      { attackTag, body: context.body, combatant: wielder, hit: TRAVELER_KIT.plungeCollision },
      enemy,
      context.party,
      context.kitEffectState.effects,
    ) ?? 0;
  const ATTACK_TAGS = [
    AttackTag.NormalAttack,
    AttackTag.ChargedAttack,
    AttackTag.ElementalSkill,
    AttackTag.ElementalBurst,
    AttackTag.PlungingAttack,
  ];
  const priceStrikes = (context: KitContext): number[] =>
    ATTACK_TAGS.map((attackTag) => priceStrike(context, attackTag));

  test("a skill gives Unforgivable and Irreparable for three seconds, its attacks and its skill and burst dealing 40% more DMG", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    const damageBonuses = priceStrikes(context);
    stepKitSecondsSendingExpiries(context, 3);

    expect(damageBonuses).toStrictEqual([0.4, 0.4, 0.4, 0.4, 0]);
    expect(priceStrikes(context)).toStrictEqual([0, 0, 0, 0, 0]);
  });

  test("a skill inside the 18-second cooldown gives nothing", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    stepKitSecondsSendingExpiries(context, 17.9);
    useSkill(context);

    expect(priceStrikes(context)).toStrictEqual([0, 0, 0, 0, 0]);
  });

  test.each([
    ["a normal attack hit extends Irreparable", AttackTag.NormalAttack, [0, 0, 0.4, 0.4, 0]],
    ["a skill hit extends Unforgivable", AttackTag.ElementalSkill, [0.4, 0.4, 0, 0, 0]],
  ])("while Path of Conflict holds, %s by a second", (_title, attackTag, damageBonusesAfterThreeSeconds) => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    hitWith(context, attackTag);
    stepKitSecondsSendingExpiries(context, 3);
    const damageBonuses = priceStrikes(context);
    stepKitSecondsSendingExpiries(context, 1);

    expect(damageBonuses).toStrictEqual(damageBonusesAfterThreeSeconds);
    expect(priceStrikes(context)).toStrictEqual([0, 0, 0, 0, 0]);
  });

  test("a second hit inside 0.1 seconds of an extension does not extend it", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    hitWith(context, AttackTag.NormalAttack);
    hitWith(context, AttackTag.NormalAttack);
    stepKitSecondsSendingExpiries(context, 4);

    expect(priceStrike(context, AttackTag.ElementalSkill)).toBe(0);
  });

  test("as Path of Conflict ends, Unforgivable and Irreparable end with it", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    for (let hitIndex = 0; hitIndex < 20; hitIndex++) {
      hitWith(context, AttackTag.NormalAttack);
      stepKitSecondsSendingExpiries(context, 0.1);
    }
    stepKitSecondsSendingExpiries(context, 14.9);
    const damageBonusBeforeEnd = priceStrike(context, AttackTag.ElementalSkill);
    stepKitSecondsSendingExpiries(context, 0.1);

    expect(damageBonusBeforeEnd).toBe(0.4);
    expect(priceStrike(context, AttackTag.ElementalSkill)).toBe(0);
  });

  test("the wielder leaving the field ends them all, and a hit after extends nothing", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    endKitSwapEffects(context.kitEffectState.effects, TRAVELER_CHARACTER_ID);
    stepKitSecondsSendingExpiries(context, 0.1);
    hitWith(context, AttackTag.NormalAttack);

    expect(priceStrikes(context)).toStrictEqual([0, 0, 0, 0, 0]);
  });

  test("in Hexerei: Secret Rite, its DMG boosts rise by 75%", () => {
    expect.hasAssertions();

    const context = createContext([TRAVELER_CHARACTER_ID, FISCHL_CHARACTER_ID, MONA_CHARACTER_ID]);
    useSkill(context);

    expect(priceStrike(context, AttackTag.NormalAttack)).toBeCloseTo(0.7);
    expect(priceStrike(context, AttackTag.ElementalBurst)).toBeCloseTo(0.7);
  });
});
