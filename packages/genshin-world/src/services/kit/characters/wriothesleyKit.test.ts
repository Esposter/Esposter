import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createWriothesleyKitBehaviour, WRIOTHESLEY_CHARACTER_ID } from "#src/services/kit/characters/wriothesleyKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { endKitSwapEffects } from "#src/services/kit/effects/endKitSwapEffects";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { assert, describe, expect, test } from "vitest";

const WRIOTHESLEY_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, WRIOTHESLEY_CHARACTER_ID);

const createWriothesleyCombatant = (ascension = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: WRIOTHESLEY_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: WRIOTHESLEY_KIT,
  level: 90,
});

// The status of an id Wriothesley holds among the team's effects
const findWriothesleyStatus = (context: KitContext, id: string): KitStatus | undefined =>
  findKitStatus(context.kitEffectState.effects, WRIOTHESLEY_CHARACTER_ID, id);

// The ATK share Prosecution Edict's buff gives him, if it has one
const readProsecutionEdictAttackShare = ({ kitEffectState: { effects } }: KitContext): number | undefined =>
  effects.find(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.source === "wriothesley-prosecution-edict",
  )?.amount;

// His health share, which a drain or a heal moves
const readHealthShare = (context: KitContext): number =>
  getPartyMember(context.party, WRIOTHESLEY_CHARACTER_ID).healthShare;

// Lands the first hit of one of his normal attacks, as a strike of his own
const strikeNormalAttack = (context: KitContext, index: number): void => {
  const hit = WRIOTHESLEY_KIT.normalAttacks[index]?.hits[0];
  if (hit?.onStrike) hit.onStrike(context, { body: context.body, combatant: context.activeCombatant, hit });
};

// A drain of his own HP by Chilling Penalty, as the party records it with him as its source
const createSelfDrain = (): KitHealthChangedEvent => ({
  bondOfLifeShare: 0,
  characterId: WRIOTHESLEY_CHARACTER_ID,
  healthShare: -0.045,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
  sourceCharacterId: WRIOTHESLEY_CHARACTER_ID,
});

describe(createWriothesleyKitBehaviour, () => {
  test("reads the strikes', charged attack's and plunges' multipliers from his proud skill group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...WRIOTHESLEY_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      WRIOTHESLEY_KIT.chargedAttack.hits[0]?.talentMultiplier,
      WRIOTHESLEY_KIT.plungeCollision.talentMultiplier,
      WRIOTHESLEY_KIT.lowPlunge.hits[0]?.talentMultiplier,
      WRIOTHESLEY_KIT.highPlunge.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.533596, 0.517987, 0.672228, 0.379041, 0.379041, 0.90742, 1.5296, 0.568288, 1.136335, 1.419344,
    ]);
  });

  test("the charged attack costs 50 stamina, his burst costs 60 energy and cools for 15 seconds, and his skill cools for 16 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: WRIOTHESLEY_KIT.burstCooldownSeconds,
      burstEnergyCost: WRIOTHESLEY_KIT.burstEnergyCost,
      chargedAttackStamina: WRIOTHESLEY_KIT.chargedAttackStamina,
      skillCooldownSeconds: WRIOTHESLEY_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 50,
      skillCooldownSeconds: 16,
    });
  });

  test("darkgold wolfbite strikes five times from 99 frames, every 5 frames", () => {
    expect.hasAssertions();
    expect(
      WRIOTHESLEY_KIT.elementalBurst.hits.map(({ hitmarkSeconds, talentMultiplier }) => ({
        frames: Math.round(hitmarkSeconds * 60),
        talentMultiplier,
      })),
    ).toStrictEqual([99, 104, 109, 114, 119].map((frames) => ({ frames, talentMultiplier: 1.272 })));
  });

  test("his strikes, charged attack, plunges and burst deal cryo, as gcsim gives them", () => {
    expect.hasAssertions();
    expect(
      [
        ...WRIOTHESLEY_KIT.normalAttacks.flatMap(({ hits }) => hits),
        ...WRIOTHESLEY_KIT.chargedAttack.hits,
        ...WRIOTHESLEY_KIT.elementalBurst.hits,
        ...WRIOTHESLEY_KIT.lowPlunge.hits,
      ].map(({ element }) => element),
    ).toStrictEqual(Array.from({ length: 13 }, () => Element.Cryo));
  });

  test("icefang rush lasts ten seconds and ends when he swaps off", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createWriothesleyCombatant());
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    expect(findWriothesleyStatus(context, "wriothesley-icefang-rush")).toStrictEqual({
      characterId: WRIOTHESLEY_CHARACTER_ID,
      id: "wriothesley-icefang-rush",
      isEndedOnSwap: true,
      kind: "status",
      secondsRemaining: toKitSeconds(10 * 60 + 1),
    });
    endKitSwapEffects(context.kitEffectState.effects, WRIOTHESLEY_CHARACTER_ID);
    expect(findWriothesleyStatus(context, "wriothesley-icefang-rush")?.secondsRemaining).toBe(0);
  });

  test("a normal attack drains 4.5% of his Max HP as Chilling Penalty while Icefang Rush holds, once per 6 frames", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createWriothesleyCombatant());
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    strikeNormalAttack(context, 0);
    strikeNormalAttack(context, 1);
    expect(readHealthShare(context)).toBeCloseTo(0.955);
    stepKitSeconds(context, toKitSeconds(5));
    strikeNormalAttack(context, 2);
    expect(readHealthShare(context)).toBeCloseTo(0.955);
    stepKitSeconds(context, toKitSeconds(2));
    strikeNormalAttack(context, 3);
    expect(readHealthShare(context)).toBeCloseTo(0.91);
  });

  test("his normal attacks drain nothing while Icefang Rush is off or his HP is at half or less", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createWriothesleyCombatant());
    strikeNormalAttack(context, 0);
    expect(readHealthShare(context)).toBe(1);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    getPartyMember(context.party, WRIOTHESLEY_CHARACTER_ID).healthShare = 0.5;
    strikeNormalAttack(context, 0);
    expect(readHealthShare(context)).toBe(0.5);
  });

  test("his enhanced normal attacks give one Cryo particle every two seconds, collected 100 frames after it is given", () => {
    expect.hasAssertions();
    const combatant = createWriothesleyCombatant();
    const context = createKitTestContext(combatant);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    strikeNormalAttack(context, 0);
    const particle = findWriothesleyStatus(context, "wriothesley-particle");
    expect(particle).toStrictEqual({
      characterId: WRIOTHESLEY_CHARACTER_ID,
      id: "wriothesley-particle",
      kind: "status",
      secondsRemaining: toKitSeconds(100),
      stacks: 1,
    });
    stepKitSeconds(context, 1);
    strikeNormalAttack(context, 1);
    expect(findWriothesleyStatus(context, "wriothesley-particle")?.stacks).toBe(1);
    assert(particle);
    WRIOTHESLEY_KIT.onKitEvent?.({ effect: particle, kind: KitEventKind.EffectExpired }, context, combatant);
    expect(getPartyMember(context.party, WRIOTHESLEY_CHARACTER_ID).energy).toBe(1);
  });

  test("from Ascension 4, each self-drain adds a Prosecution Edict stack, up to five, each raising his ATK 6%", () => {
    expect.hasAssertions();
    const combatant = createWriothesleyCombatant(4);
    const context = createKitTestContext(combatant);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    for (let drain = 0; drain < 6; drain++) WRIOTHESLEY_KIT.onKitEvent?.(createSelfDrain(), context, combatant);
    expect(findWriothesleyStatus(context, "wriothesley-prosecution-edict")?.stacks).toBe(5);
    expect(readProsecutionEdictAttackShare(context)).toBeCloseTo(0.3);
  });

  test("a heal that restores no HP adds no Prosecution Edict stack", () => {
    expect.hasAssertions();
    const combatant = createWriothesleyCombatant(4);
    const context = createKitTestContext(combatant);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    WRIOTHESLEY_KIT.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: WRIOTHESLEY_CHARACTER_ID,
        healthShare: 0,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0.2,
      },
      context,
      combatant,
    );
    expect(findWriothesleyStatus(context, "wriothesley-prosecution-edict")?.stacks).toBe(0);
  });

  test("below Ascension 4, a self-drain gives no Prosecution Edict", () => {
    expect.hasAssertions();
    const combatant = createWriothesleyCombatant(3);
    const context = createKitTestContext(combatant);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    WRIOTHESLEY_KIT.onKitEvent?.(createSelfDrain(), context, combatant);
    expect(findWriothesleyStatus(context, "wriothesley-prosecution-edict")).toBeUndefined();
  });

  test("recasting Icefang Rush resets Prosecution Edict's stacks and its ATK", () => {
    expect.hasAssertions();
    const combatant = createWriothesleyCombatant(4);
    const context = createKitTestContext(combatant);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    WRIOTHESLEY_KIT.onKitEvent?.(createSelfDrain(), context, combatant);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    expect(findWriothesleyStatus(context, "wriothesley-prosecution-edict")?.stacks).toBe(0);
    expect(readProsecutionEdictAttackShare(context)).toBe(0);
  });
});
