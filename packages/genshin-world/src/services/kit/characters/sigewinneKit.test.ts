import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createSigewinneKitBehaviour, SIGEWINNE_CHARACTER_ID } from "#src/services/kit/characters/sigewinneKit";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readCharacterKitRecord } from "#src/services/kit/readCharacterKitRecord.test";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const toFrames = (seconds: number) => Math.round(seconds * 60);
const SIGEWINNE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SIGEWINNE_CHARACTER_ID);
const { readHits, record: sigewinneRecord, toParameter } = await readCharacterKitRecord(SIGEWINNE_CHARACTER_ID);
const createSigewinneCombatant = (health: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: health }]),
  characterId: SIGEWINNE_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: SIGEWINNE_KIT,
  level: 90,
});

// The summons an action's start casts, as the kit's effects hold them
const castSummons = (action: KitAction, combatant: Combatant): KitSummon[] => {
  const context = createKitTestContext(combatant);
  action.onStart?.(context);
  return context.kitEffectState.effects.filter((effect) => effect.kind === "summon");
};

describe(createSigewinneKitBehaviour, () => {
  test("reads her strikes, Fully-Charged Aimed Shot and plunges from her proud attack group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...SIGEWINNE_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(SIGEWINNE_KIT.chargedAttack.hits).talentMultiplier,
      SIGEWINNE_KIT.plungeCollision.talentMultiplier,
      takeOne(SIGEWINNE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(SIGEWINNE_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.5261, 0.5107, 0.7829, 1.24, 0.5683, 1.1363, 1.4193];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 3);
  });

  test("lands her strikes at gcsim's hitmarks within their animations", () => {
    expect.hasAssertions();

    expect(
      SIGEWINNE_KIT.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual(
      sigewinneRecord.normalAttacks.map((action) => ({
        frames: action.animationFrames,
        hitmarks: action.hits.map(({ hitmarkFrames }) => hitmarkFrames),
      })),
    );
  });

  test("fires the Fully-Charged Aimed Shot at its record's hitmark and costs its record's stamina", () => {
    expect.hasAssertions();

    expect(toFrames(SIGEWINNE_KIT.chargedAttack.seconds)).toBe(sigewinneRecord.chargedAttack.animationFrames);
    expect(toFrames(takeOne(SIGEWINNE_KIT.chargedAttack.hits).hitmarkSeconds)).toBe(
      takeOne(sigewinneRecord.chargedAttack.hits).hitmarkFrames,
    );
    expect(SIGEWINNE_KIT.chargedAttackStamina).toBe(toParameter(sigewinneRecord.chargedAttackStamina));
  });

  test("the press casts a bubble at each of its record's bounce frames, each a share of her Max HP", () => {
    expect.hasAssertions();
    const combatant = createSigewinneCombatant(1000);
    const [summon] = castSummons(SIGEWINNE_KIT.elementalSkill, combatant);
    const bounces = readHits("bolsteringBubblebalmBounces");

    expect(toFrames(SIGEWINNE_KIT.elementalSkill.seconds)).toBe(sigewinneRecord.skill.animationFrames);
    expect(summon?.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      bounces.map(({ hitmarkFrames }) => hitmarkFrames),
    );
    expect(takeOne(summon?.hits ?? []).additiveBaseDamageBonus?.(combatant)).toBeCloseTo(
      toParameter(takeOne(bounces).multiplier) * combatant.attributes.maxHealth,
      3,
    );
  });

  test("her burst strikes six waves at its record's hitmarks, each a share of her Max HP", () => {
    expect.hasAssertions();
    const combatant = createSigewinneCombatant(1000);

    expect(toFrames(SIGEWINNE_KIT.elementalBurst.seconds)).toBe(sigewinneRecord.burst.animationFrames);
    expect(SIGEWINNE_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      sigewinneRecord.burst.hits.map(({ hitmarkFrames }) => hitmarkFrames),
    );
    for (const hit of SIGEWINNE_KIT.elementalBurst.hits)
      expect(hit.additiveBaseDamageBonus?.(combatant)).toBeCloseTo(
        toParameter(takeOne(sigewinneRecord.burst.hits).multiplier) * combatant.attributes.maxHealth,
        3,
      );
  });

  test("her burst costs its record's energy on its record's cooldown, and her press cools down on its record's", () => {
    expect.hasAssertions();

    expect(SIGEWINNE_KIT.burstEnergyCost).toBe(toParameter(sigewinneRecord.burstEnergyCost));
    expect(SIGEWINNE_KIT.burstCooldownSeconds).toBe(toParameter(sigewinneRecord.burstCooldownSeconds));
    expect(SIGEWINNE_KIT.skillCooldownSeconds).toBe(toParameter(sigewinneRecord.skillCooldownSeconds));
  });

  test("a passive takes effect at its ascension phase: a skill press gives her an 8% Hydro DMG Bonus", () => {
    expect.hasAssertions();
    const combatant = { ...createSigewinneCombatant(1000), ascension: 1 };
    const { effects } = castKitAction(SIGEWINNE_KIT.elementalSkill, combatant);

    expect(effects.filter(({ kind }) => kind === "buff")).toStrictEqual([
      {
        amount: 0.08,
        attribute: Attribute.HydroDamageBonus,
        characterId: SIGEWINNE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 18,
        source: "sigewinne-semi-strict-bedrest",
      },
    ]);
    const pricedCombatant = getBuffedCombatant(combatant, effects, createParty([SIGEWINNE_CHARACTER_ID]), new Map());
    expect(pricedCombatant.attributes.attributeTotalMap[Attribute.HydroDamageBonus]).toBeCloseTo(0.08, 5);
  });

  test("a passive does not take effect below its ascension phase: no Hydro DMG Bonus at Ascension 0", () => {
    expect.hasAssertions();
    const { effects } = castKitAction(SIGEWINNE_KIT.elementalSkill, createSigewinneCombatant(1000));

    expect(effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });
});
