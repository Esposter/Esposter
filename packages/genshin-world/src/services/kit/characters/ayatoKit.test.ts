import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { AYATO_CHARACTER_ID, createAyatoKit } from "#src/services/kit/characters/ayatoKit";
import { KUKI_CHARACTER_ID } from "#src/services/kit/characters/kukiKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const AYATO_KIT = createAyatoKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [AYATO_CHARACTER_ID]));
const MAX_HEALTH = 10_000;
const NAMISEN_SHARE = 0.005611;
const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };

const createAyatoCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: AYATO_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: AYATO_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

// The effects an action's start adds to the team's, which its owner holds
const castAction = (action: KitAction, combatant = createAyatoCombatant()): KitEffectState => {
  const kitEffectState: KitEffectState = { effects: [] };
  action.onStart?.({ body: kitBody, combatant, kitEffectState, party: createParty([AYATO_CHARACTER_ID]) });
  return kitEffectState;
};

// The stance Kamisato Art: Kyouka leaves on the team, and the Shunsuiken strike at an index of its string
const findStance = (kitEffectState: KitEffectState): KitStance | undefined =>
  kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance");
const getShunsuikenHit = (kitEffectState: KitEffectState, index: number): KitHit =>
  takeOne(findStance(kitEffectState)?.actions.normalAttacks[index]?.hits ?? []);
// The Namisen stacks a Shunsuiken strike's DMG reads, from its flat share of Max HP per stack
const readStacks = (hit: KitHit, combatant: Combatant): number =>
  Math.round((hit.additiveBaseDamageBonus?.(combatant) ?? 0) / (MAX_HEALTH * NAMISEN_SHARE));

describe(createAyatoKit, () => {
  test("reads the strikes', charged attack's and plunges' multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...AYATO_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(AYATO_KIT.chargedAttack.hits).talentMultiplier,
      AYATO_KIT.plungeCollision.talentMultiplier,
      takeOne(AYATO_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(AYATO_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.449617, 0.471572, 0.586124, 0.294485, 0.294485, 0.756043, 1.295297, 0.639324, 1.278377, 1.596762,
    ]);
  });

  test("the charged attack costs 20 stamina, and his burst costs 80 energy and cools for 20 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: AYATO_KIT.burstCooldownSeconds,
      burstEnergyCost: AYATO_KIT.burstEnergyCost,
      chargedAttackStamina: AYATO_KIT.chargedAttackStamina,
      skillCooldownSeconds: AYATO_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 20,
      burstEnergyCost: 80,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 12,
    });
  });

  test("Kamisato Art: Kyouka's water illusion hits at its 35-frame delay, and Soukai Kanka lasts six seconds", () => {
    expect.hasAssertions();
    const kitEffectState = castAction(AYATO_KIT.elementalSkill);
    const illusionHit = takeOne(AYATO_KIT.elementalSkill.hits);

    expect({
      hitmarkFrames: Math.round(illusionHit.hitmarkSeconds * 60),
      multiplier: illusionHit.talentMultiplier,
      stanceSeconds: findStance(kitEffectState)?.secondsRemaining,
      strikes: findStance(kitEffectState)?.actions.normalAttacks.length,
    }).toStrictEqual({ hitmarkFrames: 35, multiplier: 1.0148, stanceSeconds: 6, strikes: 3 });
  });

  test("each Shunsuiken strike adds a Namisen stack, and its DMG reads the stacks at its Max HP's share", () => {
    expect.hasAssertions();
    const combatant = createAyatoCombatant();
    const kitEffectState = castAction(AYATO_KIT.elementalSkill, combatant);
    const party = createParty([AYATO_CHARACTER_ID]);
    const shunsuikenHit = getShunsuikenHit(kitEffectState, 0);
    const stacks = [0, 1, 2].map(() => {
      const stacksBefore = readStacks(shunsuikenHit, combatant);
      shunsuikenHit.onStrike?.({ body: kitBody, combatant, kitEffectState, party });
      return stacksBefore;
    });

    expect(stacks).toStrictEqual([0, 1, 2]);
  });

  test("Namisen stacks stop at four, or five from Constellation 2", () => {
    expect.hasAssertions();
    const stacksAfterStrikes = (constellationCount: number): number => {
      const combatant = createAyatoCombatant(0, constellationCount);
      const kitEffectState = castAction(AYATO_KIT.elementalSkill, combatant);
      const shunsuikenHit = getShunsuikenHit(kitEffectState, 0);
      for (let strike = 0; strike < 6; strike++)
        shunsuikenHit.onStrike?.({
          body: kitBody,
          combatant,
          kitEffectState,
          party: createParty([AYATO_CHARACTER_ID]),
        });
      return readStacks(shunsuikenHit, combatant);
    };

    expect({ base: stacksAfterStrikes(0), constellation2: stacksAfterStrikes(2) }).toStrictEqual({
      base: 4,
      constellation2: 5,
    });
  });

  test("Ascension 1 sets two stacks as Kyouka is cast and the most as its water illusion explodes", () => {
    expect.hasAssertions();
    const combatant = createAyatoCombatant(1);
    const kitEffectState = castAction(AYATO_KIT.elementalSkill, combatant);
    const shunsuikenHit = getShunsuikenHit(kitEffectState, 0);
    const explosion = kitEffectState.effects.find(
      (effect): effect is KitField => effect.kind === "field" && effect.radius === Number.POSITIVE_INFINITY,
    );
    const castStacks = readStacks(shunsuikenHit, combatant);
    explosion?.onTick({
      activeCombatant: combatant,
      characterIdCombatantMap: new Map(),
      enemyMap: new Map(),
      kitEffectState,
      party: createParty([AYATO_CHARACTER_ID]),
      tickIndex: 0,
    });

    expect({ castStacks, explosionStacks: readStacks(shunsuikenHit, combatant) }).toStrictEqual({
      castStacks: 2,
      explosionStacks: 4,
    });
  });

  test("Constellation 6 sets off two extra Shunsuiken strikes of 450% on the first enemy struck once Kyouka is cast", () => {
    expect.hasAssertions();
    const combatant = createAyatoCombatant(0, 6);
    const kitEffectState = castAction(AYATO_KIT.elementalSkill, combatant);
    getShunsuikenHit(kitEffectState, 0).onStrike?.({
      body: kitBody,
      combatant,
      kitEffectState,
      party: createParty([AYATO_CHARACTER_ID]),
    });
    const extraStrikes = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(
      extraStrikes?.hits.map(({ hitmarkSeconds, talentMultiplier }) => [
        Math.round(hitmarkSeconds * 60),
        talentMultiplier,
      ]),
    ).toStrictEqual([
      [15, 4.5],
      [17, 4.5],
    ]);
  });

  test("Suiyuu's field follows the body and strikes from its first tick at 101 frames, every 30 frames", () => {
    expect.hasAssertions();
    const kitEffectState = castAction(AYATO_KIT.elementalBurst);
    const field = kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    field?.onTick({
      activeCombatant: createAyatoCombatant(),
      characterIdCombatantMap: new Map(),
      enemyMap: new Map(),
      kitEffectState,
      party: createParty([AYATO_CHARACTER_ID]),
      tickIndex: 0,
    });
    const tickSummon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect({
      hitmarkFrames: Math.round(takeOne(tickSummon?.hits ?? []).hitmarkSeconds * 60),
      isFollowing: field?.isFollowing,
      nextTickFrames: Math.round((field?.nextTickSeconds ?? 0) * 60),
      tickIntervalFrames: Math.round((field?.tickIntervalSeconds ?? 0) * 60),
    }).toStrictEqual({ hitmarkFrames: 38, isFollowing: true, nextTickFrames: 101, tickIntervalFrames: 30 });
  });

  test("leaving the field ends Soukai Kanka and clears the Namisen stacks", () => {
    expect.hasAssertions();
    const combatant = createAyatoCombatant();
    const kitEffectState = castAction(AYATO_KIT.elementalSkill, combatant);
    const shunsuikenHit = getShunsuikenHit(kitEffectState, 0);
    shunsuikenHit.onStrike?.({ body: kitBody, combatant, kitEffectState, party: createParty([AYATO_CHARACTER_ID]) });
    AYATO_KIT.onKitEvent?.(
      { characterId: KUKI_CHARACTER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: AYATO_CHARACTER_ID },
      {
        activeCombatant: combatant,
        body: kitBody,
        characterIdCombatantMap: new Map(),
        combatant,
        enemyMap: new Map(),
        kitEffectState,
        party: createParty([AYATO_CHARACTER_ID]),
        random: () => 0,
      },
    );

    expect(findStance(kitEffectState)?.secondsRemaining).toBe(0);
    expect(kitEffectState.effects.find((effect) => effect.kind === "status")?.secondsRemaining).toBe(0);
  });
});
