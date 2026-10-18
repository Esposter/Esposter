import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitInput } from "#src/models/kit/KitInput";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import type { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { MONA_CHARACTER_ID } from "#src/services/kit/characters/monaKit";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { strikeKitBubble } from "#src/services/kit/effects/strikeKitBubble";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const MONA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, MONA_CHARACTER_ID);
const NEVER_CRITICAL = (): number => 1;
const createSturdyEnemy = (): Enemy => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  health: 1e9,
  maxHealth: 1e9,
});

const createMonaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: MONA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: MONA_KIT,
  level: 90,
});

const OTHER_CHARACTER_ID = 10_000_052;
const HEXEREI_CHARACTER_ID = 10_000_029;
const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
const createOmenedEnemy = (): Enemy => ({
  ...createSturdyEnemy(),
  statuses: [{ damageTakenBonus: 0, id: "mona-omen", secondsRemaining: 10 }],
});
const createOther = (characterId = OTHER_CHARACTER_ID): Combatant => ({ ...createMonaCombatant(), characterId });

// Constellation 6's stacks are read at the Charged Attack's damage hook, as her sprint and her attack play out, one step at a time
const createConstellation6Fixture = (constellationCount = 6) => {
  const combatant = { ...createMonaCombatant(), constellationCount };
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState });
  const kitState = createKitState();
  const partyMember = createPartyMember();
  const stamina = createStamina(STAMINA_MAX);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const sprint: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: false,
    locomotionState: LocomotionState.Sprint,
  };
  const sprintFor = (seconds: number) => {
    for (let step = 0; step < Math.round(seconds * 60); step++) {
      stepKit(kitState, MONA_KIT, sprint, partyMember, stamina, 1 / 60, [], context);
      stepKitEffects(1 / 60, context);
    }
  };
  const waitFor = (seconds: number) => stepKitEffects(seconds, context);
  const getBonus = (attackTag: AttackTag) =>
    MONA_KIT.getStrikeDamageBonus?.(
      { attackTag, body: context.body, combatant, hit: takeOne(MONA_KIT.chargedAttack.hits) },
      enemy,
      createParty([MONA_CHARACTER_ID]),
      kitEffectState.effects,
    );
  // Lands the Charged Attack, as its last hit does, which resets the stacks once it has struck
  const landChargedAttack = () =>
    MONA_KIT.chargedAttack.hits
      .at(-1)
      ?.onStrike?.(context, { body: context.body, combatant, hit: takeOne(MONA_KIT.chargedAttack.hits) }, enemy);
  return { getBonus, landChargedAttack, sprintFor, waitFor };
};

describe("mona kit", () => {
  test("constellation 2 follows a normal attack's last hit with its Charged Attack's hit at the attack's hitmark, at a 20% chance", () => {
    expect.hasAssertions();
    const combatant = { ...createMonaCombatant(), constellationCount: 2 };
    const attack = takeOne(MONA_KIT.normalAttacks);
    const lastHit = takeOne(attack.hits.slice(-1));
    const followUp = MONA_KIT.getNormalAttackExtraHit?.(
      createKitTestContext(combatant, { random: () => 0.1 }),
      lastHit,
      MONA_KIT.normalAttacks.indexOf(attack),
    );

    expect(followUp).toStrictEqual({ ...takeOne(MONA_KIT.chargedAttack.hits), hitmarkSeconds: lastHit.hitmarkSeconds });
  });

  test("constellation 2 adds no follow-up at a roll of 20% or more, or on a hit that is not the attack's own last hit", () => {
    expect.hasAssertions();
    const combatant = { ...createMonaCombatant(), constellationCount: 2 };
    const attack = takeOne(MONA_KIT.normalAttacks);
    const chainIndex = MONA_KIT.normalAttacks.indexOf(attack);
    const lastHit = takeOne(attack.hits.slice(-1));

    expect([
      MONA_KIT.getNormalAttackExtraHit?.(createKitTestContext(combatant, { random: () => 0.5 }), lastHit, chainIndex),
      MONA_KIT.getNormalAttackExtraHit?.(
        createKitTestContext(combatant, { random: () => 0.1 }),
        { ...lastHit },
        chainIndex,
      ),
    ]).toStrictEqual([undefined, undefined]);
  });

  test("constellation 2 follows up at most once in 5 seconds, and again after them", () => {
    expect.hasAssertions();
    const combatant = { ...createMonaCombatant(), constellationCount: 2 };
    const attack = takeOne(MONA_KIT.normalAttacks);
    const chainIndex = MONA_KIT.normalAttacks.indexOf(attack);
    const lastHit = takeOne(attack.hits.slice(-1));
    const context = createKitTestContext(combatant, { random: () => 0.1 });
    const first = MONA_KIT.getNormalAttackExtraHit?.(context, lastHit, chainIndex);
    const second = MONA_KIT.getNormalAttackExtraHit?.(context, lastHit, chainIndex);
    stepKitTestEffects(5, context);
    const third = MONA_KIT.getNormalAttackExtraHit?.(context, lastHit, chainIndex);

    expect([first, second, third].map((followUp) => followUp !== undefined)).toStrictEqual([true, false, true]);
  });

  test("constellation 2 adds no follow-up below Constellation 2", () => {
    expect.hasAssertions();
    const attack = takeOne(MONA_KIT.normalAttacks);

    expect(
      MONA_KIT.getNormalAttackExtraHit?.(
        createKitTestContext(createMonaCombatant(), { random: () => 0.1 }),
        takeOne(attack.hits.slice(-1)),
        MONA_KIT.normalAttacks.indexOf(attack),
      ),
    ).toBeUndefined();
  });

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MONA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(MONA_KIT.chargedAttack.hits).talentMultiplier,
      MONA_KIT.plungeCollision.talentMultiplier,
      takeOne(MONA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(MONA_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.376, 0.36, 0.448, 0.5616, 1.4972, 0.5683, 1.1363, 1.4193];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Mirror Reflection lands four ticks and then its explosion, and ends with the explosion", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createMonaCombatant(), { kitEffectState });
    MONA_KIT.elementalSkill.onStart?.(context);

    // A single step past the explosion at 329 frames lands every hit of the summon, and the summon then ends
    const strikes = stepKitTestEffects(6, context);
    expect(strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([0.32, 0.32, 0.32, 0.32, 1.328]);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("ascension 4 adds 20% of its Energy Recharge to its Hydro DMG Bonus as its hits are priced", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const energyRecharge = combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge];
    const party = createParty([MONA_CHARACTER_ID]);
    const pricedAsCharacter = getBuffedCombatant({ ...combatant, ascension: 4 }, [], party, new Map());
    expect(pricedAsCharacter.attributes.attributeTotalMap[Attribute.HydroDamageBonus]).toBeCloseTo(
      0.2 * energyRecharge,
      5,
    );
    expect(getBuffedCombatant(combatant, [], party, new Map())).toBe(combatant);
  });

  test("ascension 1 casts a phantom for every 2 seconds of sprint, which explodes at half of Mirror Reflection's", () => {
    expect.hasAssertions();
    const sprint: KitInput = {
      height: 0,
      isAttackHeld: false,
      isAttackPressed: false,
      isBurstPressed: false,
      isSkillHeld: false,
      isSkillPressed: false,
      locomotionState: LocomotionState.Sprint,
    };
    const sprintFor = (ascension: number) => {
      const context = createKitTestContext({ ...createMonaCombatant(), ascension });
      const kitState = createKitState();
      const partyMember = createPartyMember();
      const stamina = createStamina(STAMINA_MAX);
      // 2.17 seconds of sprint at the fixed step, past the first 2 seconds
      for (let step = 0; step < 130; step++)
        stepKit(kitState, MONA_KIT, sprint, partyMember, stamina, 1 / 60, [], context);
      return context;
    };

    expect(sprintFor(0).kitEffectState.effects).toStrictEqual([]);
    const context = sprintFor(1);
    expect(context.kitEffectState.effects.map(({ kind }) => kind)).toStrictEqual(["summon"]);

    // The phantom's explosion lands once its 2 seconds run out, at 0.5 of the explosion's multiplier of 1.328
    const strikes = stepKitTestEffects(2, context);
    expect(strikes.map(({ hit }) => hit.talentMultiplier)).toHaveLength(1);
    expect(strikes[0]?.hit.talentMultiplier).toBeCloseTo(0.664, 3);
  });

  test("holds each enemy its Stellaris Phantasm strikes in a bubble, with no Omen on it until the bubble bursts", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const enemy = createSturdyEnemy();
    strikeKitBubble(kitEffectState, enemy, combatant, takeOne(MONA_KIT.elementalBurst.hits));

    expect(kitEffectState.effects.map(({ kind }) => kind)).toStrictEqual(["bubble"]);
    expect(enemy.statuses).toStrictEqual([]);
  });

  test("bursts its bubble on a hit with poise damage, the Omen running from the burst and the explosion on that enemy alone", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const enemy = createSturdyEnemy();
    strikeKitBubble(kitEffectState, enemy, combatant, takeOne(MONA_KIT.elementalBurst.hits));
    const poiseHit = MONA_KIT.plungeCollision;
    const context = createKitTestContext(combatant, { enemyTables, random: NEVER_CRITICAL });
    strikeEnemy(enemy, poiseHit, combatant, context);
    strikeKitBubble(kitEffectState, enemy, combatant, poiseHit);

    // The Omen's 4 seconds and 42% DMG taken, from the burst at index 3 and 9 of the burst group
    expect(enemy.statuses).toStrictEqual([{ damageTakenBonus: 0.42, id: "mona-omen", secondsRemaining: 4 }]);
    const strikes = stepKitTestEffects(0.5, createKitTestContext(combatant, { kitEffectState }));
    expect(strikes.map(({ target }) => target)).toStrictEqual([enemy]);
    expect(strikes[0]?.hit.talentMultiplier).toBeCloseTo(4.424, 3);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("bursts its bubble when its 8 seconds run out, and the Omen runs from then", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const enemy = createSturdyEnemy();
    strikeKitBubble(kitEffectState, enemy, combatant, takeOne(MONA_KIT.elementalBurst.hits));
    const context = createKitTestContext(combatant, { kitEffectState });

    expect(stepKitTestEffects(7.9, context)).toStrictEqual([]);
    expect(enemy.statuses).toStrictEqual([]);
    const strikes = stepKitTestEffects(0.2, context);
    expect(strikes.map(({ target }) => target)).toStrictEqual([enemy]);
    expect(enemy.statuses.map(({ secondsRemaining }) => secondsRemaining)).toStrictEqual([4]);
  });

  test("constellation 6 adds 60% to her next charged attack for each second of sprint, up to three seconds", () => {
    expect.hasAssertions();
    const { getBonus, sprintFor } = createConstellation6Fixture();
    sprintFor(1.5);
    expect(getBonus(AttackTag.ChargedAttack)).toBeCloseTo(0.6);
    sprintFor(2);
    expect(getBonus(AttackTag.ChargedAttack)).toBeCloseTo(1.8);
    sprintFor(2);
    expect(getBonus(AttackTag.ChargedAttack)).toBeCloseTo(1.8);
  });

  test("constellation 6's bonus lasts eight seconds from its last stack", () => {
    expect.hasAssertions();
    const { getBonus, sprintFor, waitFor } = createConstellation6Fixture();
    sprintFor(1.5);
    waitFor(6);
    expect(getBonus(AttackTag.ChargedAttack)).toBeCloseTo(0.6);
    waitFor(2);
    expect(getBonus(AttackTag.ChargedAttack)).toBe(0);
  });

  test("constellation 6's charged attack resets the stacks once it has struck", () => {
    expect.hasAssertions();
    const { getBonus, landChargedAttack, sprintFor } = createConstellation6Fixture();
    sprintFor(2.5);
    expect(getBonus(AttackTag.ChargedAttack)).toBeCloseTo(1.2);
    landChargedAttack();
    expect(getBonus(AttackTag.ChargedAttack)).toBe(0);
  });

  test("constellation 6 adds nothing to a normal attack, and a new sprint keeps the stacks the bonus still holds", () => {
    expect.hasAssertions();
    const { getBonus, sprintFor, waitFor } = createConstellation6Fixture();
    sprintFor(2.5);
    expect(getBonus(AttackTag.NormalAttack)).toBe(0);
    waitFor(0.5);
    sprintFor(0.5);
    expect(getBonus(AttackTag.ChargedAttack)).toBeCloseTo(1.2);
  });

  test("constellation 5 adds nothing to her charged attack after sprinting", () => {
    expect.hasAssertions();
    const { getBonus, sprintFor } = createConstellation6Fixture(5);
    sprintFor(2);
    expect(getBonus(AttackTag.ChargedAttack)).toBe(0);
  });

  test("constellation 1 gives a party member's Electro-Charged, Vaporize, Lunar-Charged and Lunar-Crystallize 15% DMG for 8 seconds after it hits an Omen", () => {
    expect.hasAssertions();
    const mona = { ...createMonaCombatant(), constellationCount: 1 };
    const other = createOther();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(mona, {
      characterIdCombatantMap: new Map([
        [MONA_CHARACTER_ID, mona],
        [OTHER_CHARACTER_ID, other],
      ]),
      kitEffectState,
      party: createParty([MONA_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
    const readBonus = (reactionType: ReactionType) =>
      MONA_KIT.getPartyReactionBonus?.(
        mona,
        { combatant: other, element: Element.Electro, enemy: createSturdyEnemy(), reactionType },
        context,
      )?.damageBonus ?? 0;
    const before = readBonus(TransformativeReactionType.ElectroCharged);
    MONA_KIT.onKitEvent?.(
      { element: Element.Electro, enemy: createOmenedEnemy(), kind: KitEventKind.EnemyHit, striker: other },
      context,
      mona,
    );
    const afterHit = {
      electroCharged: readBonus(TransformativeReactionType.ElectroCharged),
      lunarCharged: readBonus(LunarReactionType.LunarCharged),
      lunarCrystallize: readBonus(LunarReactionType.LunarCrystallize),
      vaporize: readBonus(AmplifyingReactionType.Vaporize),
    };
    stepKitTestEffects(8, context);

    expect({ afterExpiry: readBonus(TransformativeReactionType.ElectroCharged), afterHit, before }).toStrictEqual({
      afterExpiry: 0,
      afterHit: { electroCharged: 0.15, lunarCharged: 0.15, lunarCrystallize: 0.15, vaporize: 0.15 },
      before: 0,
    });
  });

  test("constellation 1 adds nothing below Constellation 1, or from a hit on an enemy without an Omen", () => {
    expect.hasAssertions();
    const other = createOther();
    const readAfterHit = (constellationCount: number, enemy: Enemy) => {
      const mona = { ...createMonaCombatant(), constellationCount };
      const context = createKitTestContext(mona, {
        characterIdCombatantMap: new Map([
          [MONA_CHARACTER_ID, mona],
          [OTHER_CHARACTER_ID, other],
        ]),
        kitEffectState: { effects: [] },
        party: createParty([MONA_CHARACTER_ID, OTHER_CHARACTER_ID]),
      });
      MONA_KIT.onKitEvent?.(
        { element: Element.Electro, enemy, kind: KitEventKind.EnemyHit, striker: other },
        context,
        mona,
      );
      return (
        MONA_KIT.getPartyReactionBonus?.(
          mona,
          {
            combatant: other,
            element: Element.Electro,
            enemy: createSturdyEnemy(),
            reactionType: TransformativeReactionType.ElectroCharged,
          },
          context,
        )?.damageBonus ?? 0
      );
    };

    expect({ below: readAfterHit(0, createOmenedEnemy()), plain: readAfterHit(1, createSturdyEnemy()) }).toStrictEqual({
      below: 0,
      plain: 0,
    });
  });

  test("constellation 1's bonus is multiplied by 160% for a member off the field while Mona is Hexerei with a second Hexerei member", () => {
    expect.hasAssertions();
    const mona = { ...createMonaCombatant(), constellationCount: 1 };
    const readWithActive = (active: Combatant, teamMemberId: number) => {
      const other = createOther(teamMemberId);
      const context = createKitTestContext(active, {
        characterIdCombatantMap: new Map([
          [MONA_CHARACTER_ID, mona],
          [teamMemberId, other],
        ]),
        kitEffectState: { effects: [] },
        party: createParty([MONA_CHARACTER_ID, teamMemberId]),
      });
      MONA_KIT.onKitEvent?.(
        { element: Element.Electro, enemy: createOmenedEnemy(), kind: KitEventKind.EnemyHit, striker: other },
        context,
        mona,
      );
      return (
        MONA_KIT.getPartyReactionBonus?.(
          mona,
          {
            combatant: other,
            element: Element.Electro,
            enemy: createSturdyEnemy(),
            reactionType: TransformativeReactionType.ElectroCharged,
          },
          context,
        )?.damageBonus ?? 0
      );
    };

    expect({
      offFieldHexerei: readWithActive(mona, HEXEREI_CHARACTER_ID),
      offFieldNoTeam: readWithActive(mona, OTHER_CHARACTER_ID),
      onFieldHexerei: readWithActive(createOther(HEXEREI_CHARACTER_ID), HEXEREI_CHARACTER_ID),
    }).toStrictEqual({ offFieldHexerei: expect.closeTo(0.24), offFieldNoTeam: 0.15, onFieldHexerei: 0.15 });
  });

  test("constellation 1 gives a party member's Hydro Swirl 15% DMG for 8 seconds after it hits an Omen, and no other Swirl", () => {
    expect.hasAssertions();
    const mona = { ...createMonaCombatant(), constellationCount: 1 };
    const other = createOther();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(mona, {
      characterIdCombatantMap: new Map([
        [MONA_CHARACTER_ID, mona],
        [OTHER_CHARACTER_ID, other],
      ]),
      kitEffectState,
      party: createParty([MONA_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
    const readBonus = (element: Element) =>
      MONA_KIT.getPartyReactionBonus?.(
        mona,
        { combatant: other, element, enemy: createSturdyEnemy(), reactionType: TransformativeReactionType.Swirl },
        context,
      )?.damageBonus ?? 0;
    MONA_KIT.onKitEvent?.(
      { element: Element.Electro, enemy: createOmenedEnemy(), kind: KitEventKind.EnemyHit, striker: other },
      context,
      mona,
    );
    const afterHit = { anemo: readBonus(Element.Anemo), hydro: readBonus(Element.Hydro) };
    stepKitTestEffects(8, context);

    expect({ afterExpiry: readBonus(Element.Hydro), afterHit }).toStrictEqual({
      afterExpiry: 0,
      afterHit: { anemo: 0, hydro: 0.15 },
    });
  });

  test("constellation 4 gives 15% CRIT Rate to a party member's strike on an enemy under an Omen, and nothing below it or on another enemy", () => {
    expect.hasAssertions();
    const party = createParty([MONA_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const other = createOther();
    const hit = takeOne(MONA_KIT.elementalBurst.hits);
    const readPartyRate = (constellationCount: number, enemy: Enemy) =>
      MONA_KIT.getPartyStrikeBonus?.(
        { ...createMonaCombatant(), constellationCount },
        { body: kitBody, combatant: other, hit },
        enemy,
        party,
        [],
        new Map(),
      )?.criticalRateBonus ?? 0;

    expect({
      below: readPartyRate(3, createOmenedEnemy()),
      omened: readPartyRate(4, createOmenedEnemy()),
      plain: readPartyRate(4, createSturdyEnemy()),
    }).toStrictEqual({ below: 0, omened: 0.15, plain: 0 });
  });

  test("constellation 4 counts a bubble holding the enemy as an Omen, for Mona's own strikes too", () => {
    expect.hasAssertions();
    const mona = { ...createMonaCombatant(), constellationCount: 4 };
    const party = createParty([MONA_CHARACTER_ID]);
    const hit = takeOne(MONA_KIT.elementalBurst.hits);
    const bubbled = createSturdyEnemy();
    const kitEffectState: KitEffectState = { effects: [] };
    strikeKitBubble(kitEffectState, bubbled, mona, hit);
    const readOwnRate = (enemy: Enemy, effects: KitEffectState["effects"]) =>
      MONA_KIT.getStrikeCriticalRateBonus?.({ body: kitBody, combatant: mona, hit }, enemy, party, effects) ?? 0;

    expect({
      bubbled: readOwnRate(bubbled, kitEffectState.effects),
      plain: readOwnRate(createSturdyEnemy(), []),
    }).toStrictEqual({ bubbled: 0.15, plain: 0 });
  });

  test("constellation 4 gives 15% CRIT DMG to a Hexerei strike on an Omen while Mona is Hexerei with a second Hexerei member", () => {
    expect.hasAssertions();
    const mona = { ...createMonaCombatant(), constellationCount: 4 };
    const hexerei = createOther(HEXEREI_CHARACTER_ID);
    const hit = takeOne(MONA_KIT.elementalBurst.hits);
    const omened = createOmenedEnemy();
    const hexereiParty = createParty([MONA_CHARACTER_ID, HEXEREI_CHARACTER_ID]);
    const plainParty = createParty([MONA_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const readPartyDamage = (party: ReturnType<typeof createParty>, striker: Combatant) =>
      MONA_KIT.getPartyStrikeBonus?.(mona, { body: kitBody, combatant: striker, hit }, omened, party, [], new Map())
        ?.criticalDamageBonus ?? 0;

    expect({
      hexereiStrike: readPartyDamage(hexereiParty, hexerei),
      ownStrike:
        MONA_KIT.getStrikeCriticalDamageBonus?.({ body: kitBody, combatant: mona, hit }, omened, hexereiParty, []) ?? 0,
      plainTeam: readPartyDamage(plainParty, hexerei),
      otherStrike: readPartyDamage(hexereiParty, createOther()),
    }).toStrictEqual({ hexereiStrike: 0.15, ownStrike: 0.15, otherStrike: 0, plainTeam: 0 });
  });

  test("constellation 4 gives no CRIT DMG to a Hexerei strike while a second Hexerei character is owned but not deployed", () => {
    expect.hasAssertions();
    const mona = { ...createMonaCombatant(), constellationCount: 4 };
    const party = createParty([MONA_CHARACTER_ID, OTHER_CHARACTER_ID]);
    party.characterIdMemberMap.set(HEXEREI_CHARACTER_ID, createPartyMember());

    expect(
      MONA_KIT.getStrikeCriticalDamageBonus?.(
        { body: kitBody, combatant: mona, hit: takeOne(MONA_KIT.elementalBurst.hits) },
        createOmenedEnemy(),
        party,
        [],
      ),
    ).toBe(0);
  });
});
