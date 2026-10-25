import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import {
  createMikaKitBehaviour,
  EAGLEPLUME_ID,
  EAGLEPLUME_INTERVAL_ID,
  MIKA_CHARACTER_ID,
  SOULWIND_ID,
} from "#src/services/kit/characters/mikaKit";
import { castKitAction, createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const MIKA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, MIKA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const PARTNER_CHARACTER_ID = 10_000_001;

const createMikaCombatant = (characterId: number, constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId,
  constellationCount,
  elementalResonances: [],
  kit: MIKA_KIT,
  level: 90,
});

// Mika and a partner on one team, the party its heals are recorded on
const createTeam = (mika: Combatant, partner: Combatant, kitEffectState: KitEffectState) => {
  const party = createParty([mika.characterId, partner.characterId]);
  const context = createKitTestContext(mika, {
    characterIdCombatantMap: new Map([
      [mika.characterId, mika],
      [partner.characterId, partner],
    ]),
    kitEffectState,
    party,
  });
  return { context, party };
};

const landHit = (context: KitContext, combatant: Combatant, attackTag: AttackTag, striker: Combatant) =>
  MIKA_KIT.onKitEvent?.(
    {
      attackTag,
      element: Element.Cryo,
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      kind: KitEventKind.EnemyHit,
      striker,
    },
    context,
    combatant,
  );

// The ATK SPD bonus a character holds from the Starfrost Swirl, as its buff amount
const findAtkSpdBonus = (kitEffectState: KitEffectState, characterId: number): number | undefined => {
  const buff = kitEffectState.effects.find(
    (effect) =>
      effect.kind === "buff" && effect.characterId === characterId && effect.attribute === Attribute.NormalAttackSpeed,
  );
  return buff?.kind === "buff" ? buff.amount : undefined;
};

const countHeals = (party: Party, characterId: number) =>
  party.healthChanges.filter((change) => change.characterId === characterId).length;

describe(createMikaKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and skill's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MIKA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      MIKA_KIT.chargedAttack.hits[0]?.talentMultiplier,
      MIKA_KIT.plungeCollision.talentMultiplier,
      MIKA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      MIKA_KIT.highPlunge.hits[0]?.talentMultiplier,
      MIKA_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.432632, 0.415019, 0.545034, 0.276146, 0.276146, 0.708743, 1.12746, 0.639324, 1.278377, 1.596762, 0.672,
    ]);
  });

  test("his burst costs 70 energy and cools for 18 seconds, his charged attack costs 25 stamina, and his skill cools for 15 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: MIKA_KIT.burstCooldownSeconds,
      burstEnergyCost: MIKA_KIT.burstEnergyCost,
      chargedAttackStamina: MIKA_KIT.chargedAttackStamina,
      skillCooldownSeconds: MIKA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 18,
      burstEnergyCost: 70,
      chargedAttackStamina: 25,
      skillCooldownSeconds: 15,
    });
  });

  test("his press strikes at 17 frames and his hold releases a flare at 12 frames from its own minimum half second", () => {
    expect.hasAssertions();
    const [hold] = MIKA_KIT.elementalSkillHolds ?? [];
    expect({
      holdHitmarkFrames: Math.round((hold?.action.hits[0]?.hitmarkSeconds ?? 0) * 60),
      holdMinimumHeldSeconds: hold?.minimumHeldSeconds,
      pressHitmarkFrames: Math.round((MIKA_KIT.elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({ holdHitmarkFrames: 12, holdMinimumHeldSeconds: 0.5, pressHitmarkFrames: 17 });
  });

  test("his strikes land their hits at 20, 14, 16, 15 and 24 frames, and his fifth strike at 30", () => {
    expect.hasAssertions();
    const hitmarks: number[] = MIKA_KIT.normalAttacks.flatMap((action: KitAction) =>
      action.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    );
    expect(hitmarks).toStrictEqual([20, 14, 16, 15, 24, 30]);
  });
});

describe("the Eagleplume state, Soulwind and Constellation 1", () => {
  test("his burst grants the Eagleplume state to every party member for 15 seconds, and it ends after", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const mika = createMikaCombatant(MIKA_CHARACTER_ID);
    const partner = createMikaCombatant(PARTNER_CHARACTER_ID);
    const { context } = createTeam(mika, partner, kitEffectState);
    castKitAction(MIKA_KIT.elementalBurst, mika, kitEffectState);
    const eagleplumeStates = () =>
      [mika, partner].map(({ characterId }) =>
        checkIsKitStatusActive(kitEffectState.effects, characterId, EAGLEPLUME_ID),
      );
    stepKitSeconds(context, 2);
    const granted = eagleplumeStates();
    stepKitSeconds(context, 12);
    const atFourteenSeconds = eagleplumeStates();
    stepKitSeconds(context, 3);
    const atSeventeenSeconds = eagleplumeStates();
    expect({ atFourteenSeconds, atSeventeenSeconds, granted }).toStrictEqual({
      atFourteenSeconds: [true, true],
      atSeventeenSeconds: [false, false],
      granted: [true, true],
    });
  });

  test("a normal attack by a character under the Eagleplume state heals it once per 2.5 seconds, without Constellation 1", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const mika = createMikaCombatant(MIKA_CHARACTER_ID);
    const partner = createMikaCombatant(PARTNER_CHARACTER_ID);
    const { context, party } = createTeam(mika, partner, kitEffectState);
    addKitStatus(kitEffectState, PARTNER_CHARACTER_ID, { id: EAGLEPLUME_ID, secondsRemaining: 15 });
    landHit(context, mika, AttackTag.NormalAttack, partner);
    landHit(context, mika, AttackTag.NormalAttack, partner);
    const beforeInterval = countHeals(party, PARTNER_CHARACTER_ID);
    stepKitSeconds(context, 2.4);
    landHit(context, mika, AttackTag.NormalAttack, partner);
    const stillInInterval = countHeals(party, PARTNER_CHARACTER_ID);
    stepKitSeconds(context, 0.2);
    landHit(context, mika, AttackTag.NormalAttack, partner);
    expect({ beforeInterval, stillInInterval, afterInterval: countHeals(party, PARTNER_CHARACTER_ID) }).toStrictEqual({
      afterInterval: 2,
      beforeInterval: 1,
      stillInInterval: 1,
    });
  });

  test("his press grants every party member the ATK SPD bonus and Soulwind for 12 seconds, and his hold grants the same", () => {
    expect.hasAssertions();
    const pressState: KitEffectState = { effects: [] };
    const mika = createMikaCombatant(MIKA_CHARACTER_ID);
    const partner = createMikaCombatant(PARTNER_CHARACTER_ID);
    const { context } = createTeam(mika, partner, pressState);
    MIKA_KIT.elementalSkill.onStart?.(context);
    const soulwindOn = (effectState: KitEffectState) =>
      [mika, partner].map(
        ({ characterId }) =>
          findAtkSpdBonus(effectState, characterId) !== undefined &&
          checkIsKitStatusActive(effectState.effects, characterId, SOULWIND_ID),
      );
    const pressGranted = soulwindOn(pressState);
    stepKitSeconds(context, 11);
    const pressAt11 = soulwindOn(pressState);
    stepKitSeconds(context, 2);
    const pressAt13 = soulwindOn(pressState);
    const holdState: KitEffectState = { effects: [] };
    const holdContext = createKitTestContext(mika, {
      characterIdCombatantMap: context.characterIdCombatantMap,
      kitEffectState: holdState,
      party: context.party,
    });
    MIKA_KIT.elementalSkillHolds?.[0]?.action.onStart?.(holdContext);
    const holdGranted = soulwindOn(holdState);
    expect({ holdGranted, pressAt11, pressAt13, pressGranted }).toStrictEqual({
      holdGranted: [true, true],
      pressAt11: [true, true],
      pressAt13: [false, false],
      pressGranted: [true, true],
    });
  });

  test("at Constellation 1 a character under Soulwind waits only as long as its ATK SPD bonus shortens the 2.5 seconds", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const mika = createMikaCombatant(MIKA_CHARACTER_ID, 1);
    const partner = createMikaCombatant(PARTNER_CHARACTER_ID);
    const { context } = createTeam(mika, partner, kitEffectState);
    MIKA_KIT.elementalSkill.onStart?.(context);
    addKitStatus(kitEffectState, PARTNER_CHARACTER_ID, { id: EAGLEPLUME_ID, secondsRemaining: 15 });
    landHit(context, mika, AttackTag.NormalAttack, partner);
    const bonus = findAtkSpdBonus(kitEffectState, PARTNER_CHARACTER_ID) ?? 0;
    const interval = findKitStatus(
      kitEffectState.effects,
      PARTNER_CHARACTER_ID,
      EAGLEPLUME_INTERVAL_ID,
    )?.secondsRemaining;
    expect(bonus).toBeGreaterThan(0);
    expect(interval).toBeCloseTo(2.5 * (1 - bonus), 10);
  });

  test("without Constellation 1 a character under Soulwind keeps the interval at 2.5 seconds", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const mika = createMikaCombatant(MIKA_CHARACTER_ID);
    const partner = createMikaCombatant(PARTNER_CHARACTER_ID);
    const { context } = createTeam(mika, partner, kitEffectState);
    MIKA_KIT.elementalSkill.onStart?.(context);
    addKitStatus(kitEffectState, PARTNER_CHARACTER_ID, { id: EAGLEPLUME_ID, secondsRemaining: 15 });
    landHit(context, mika, AttackTag.NormalAttack, partner);
    expect(findKitStatus(kitEffectState.effects, PARTNER_CHARACTER_ID, EAGLEPLUME_INTERVAL_ID)?.secondsRemaining).toBe(
      2.5,
    );
  });

  test("at Constellation 1 a character not under Soulwind keeps the interval at 2.5 seconds", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const mika = createMikaCombatant(MIKA_CHARACTER_ID, 1);
    const partner = createMikaCombatant(PARTNER_CHARACTER_ID);
    const { context } = createTeam(mika, partner, kitEffectState);
    addKitStatus(kitEffectState, PARTNER_CHARACTER_ID, { id: EAGLEPLUME_ID, secondsRemaining: 15 });
    landHit(context, mika, AttackTag.NormalAttack, partner);
    expect(findKitStatus(kitEffectState.effects, PARTNER_CHARACTER_ID, EAGLEPLUME_INTERVAL_ID)?.secondsRemaining).toBe(
      2.5,
    );
  });
});
