import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createIneffaKitBehaviour, INEFFA_CHARACTER_ID } from "#src/services/kit/characters/ineffaKit";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const INEFFA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, INEFFA_CHARACTER_ID);
const createIneffaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseDefense, value: 1000 }]),
  characterId: INEFFA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: INEFFA_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

describe(createIneffaKitBehaviour, () => {
  const BIRGITTA_ID = "birgitta";
  const castBirgitta = (action: KitAction, effects: KitEffect[] = []): KitSummon =>
    takeOne(
      castKitAction(action, createIneffaCombatant(), { effects }).effects.filter(
        (effect): effect is KitSummon => effect.kind === "summon" && effect.id === BIRGITTA_ID,
      ),
    );

  test("reads each talent multiplier from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...INEFFA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...INEFFA_KIT.chargedAttack.hits.map((hit) => hit.talentMultiplier),
      INEFFA_KIT.plungeCollision.talentMultiplier,
      takeOne(INEFFA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(INEFFA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(INEFFA_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(INEFFA_KIT.elementalBurst.hits).talentMultiplier,
    ].map((multiplier) => Number(multiplier.toFixed(4)));

    expect(multipliers).toStrictEqual([0.3484, 0.3422, 0.2276, 0.5607, 0.9494, 0.6393, 1.2784, 1.5968, 0.864, 6.768]);
  });

  test("reads her stamina, her cooldowns and her burst's energy cost from her proud skill groups", () => {
    expect.hasAssertions();
    expect([
      INEFFA_KIT.chargedAttackStamina,
      INEFFA_KIT.skillCooldownSeconds,
      INEFFA_KIT.burstCooldownSeconds,
      INEFFA_KIT.burstEnergyCost,
    ]).toStrictEqual([25, 16, 15, 60]);
  });

  test("lands her strikes at their hitmarks, her charged attack at 23 frames, her skill at 26, and her burst at 111", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: INEFFA_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: INEFFA_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackHitmarkFrames: INEFFA_KIT.normalAttacks.map(({ hits }) =>
        Math.round(takeOne(hits).hitmarkSeconds * 60),
      ),
      skillHitmarkFrames: INEFFA_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    }).toStrictEqual({
      burstHitmarkFrames: [111],
      chargedAttackHitmarkFrames: [23],
      normalAttackHitmarkFrames: [9, 17, 10, 27],
      skillHitmarkFrames: [26],
    });
  });

  test("her skill summons Birgitta at 68 frames, who stands 1,200 frames and discharges 42 frames in and every 119 after", () => {
    expect.hasAssertions();
    const birgitta = castBirgitta(INEFFA_KIT.elementalSkill);

    expect(birgitta.spawnSeconds).toBeCloseTo(68 / 60);
    expect(birgitta.secondsRemaining).toBeCloseTo((68 + 1200) / 60);
    expect(birgitta.hits).toHaveLength(10);
    expect(birgitta.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)).slice(0, 2)).toStrictEqual([
      110, 229,
    ]);
  });

  test("her burst summons Birgitta again and ends the one on the field, as gcsim restarts her discharges", () => {
    expect.hasAssertions();
    const skillBirgitta = castBirgitta(INEFFA_KIT.elementalSkill);
    const birgittas = castKitAction(INEFFA_KIT.elementalBurst, createIneffaCombatant(), {
      effects: [skillBirgitta],
    }).effects.filter((effect): effect is KitSummon => effect.kind === "summon" && effect.id === BIRGITTA_ID);

    expect(skillBirgitta.secondsRemaining).toBe(0);
    expect(birgittas.map(({ spawnSeconds }) => Math.round((spawnSeconds ?? 0) * 60))).toStrictEqual([68, 111]);
  });

  test("her skill places a shield 4 frames in, priced by her ATK and the table's flat HP, for 20 seconds", () => {
    expect.hasAssertions();
    const combatant = createIneffaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    INEFFA_KIT.elementalSkill.onStart?.(context);
    const field = takeOne(kitEffectState.effects.filter((effect): effect is KitField => effect.kind === "field"));
    expect(field.nextTickSeconds).toBeCloseTo(4 / 60);

    field.onTick(context, 0);
    const shield = takeOne(kitEffectState.effects.filter((effect): effect is KitShield => effect.kind === "shield"));
    expect(shield.health).toBeCloseTo(2.21184 * combatant.attributes.attack + 1386.6759);
    expect(shield.secondsRemaining).toBe(20);
  });

  test("her Moonsign Benediction turns Electro-Charged Lunar, with 0.7% Base DMG Bonus each 100 ATK, at most 14%", () => {
    expect.hasAssertions();

    const benediction = INEFFA_KIT.moonsignBenediction;
    const baseDamageBonuses = [1000, 3000].map((baseAttack) =>
      benediction?.getBaseDamageBonus?.({
        ...createIneffaCombatant(),
        attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: baseAttack }]),
      }),
    );

    expect({ baseDamageBonuses, lunarReactionTypes: benediction?.lunarReactionTypes }).toStrictEqual({
      baseDamageBonuses: [expect.closeTo(0.07), 0.14],
      lunarReactionTypes: [LunarReactionType.LunarCharged],
    });
  });
});

describe("panoramic Permutation Protocol", () => {
  const PERMUTATION_SOURCE = "ineffa-permutation";
  const OTHER_CHARACTER_ID = 10_000_001;

  // Supreme Instruction: Cyclonic Exterminator with Ineffa at the given ascension and attack, and the buffs it leaves
  const castBurstBuffs = (ascension: number, attack: number): KitBuff[] => {
    const combatant = {
      ...createIneffaCombatant(),
      ascension,
      attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: attack }]),
    };
    const kitEffectState: KitEffectState = { effects: [] };
    INEFFA_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    return kitEffectState.effects.filter(
      (effect): effect is KitBuff => effect.kind === "buff" && effect.source === PERMUTATION_SOURCE,
    );
  };

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstBuffs(4, 1000)).toStrictEqual([
      {
        amount: 0.06 * 1000,
        attribute: Attribute.ElementalMastery,
        characterId: INEFFA_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 20,
        source: PERMUTATION_SOURCE,
      },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstBuffs(3, 1000)).toStrictEqual([]);
  });

  test("the permutation moves to the active member on a swap and leaves the one it left", () => {
    expect.hasAssertions();

    const combatant = {
      ...createIneffaCombatant(),
      ascension: 4,
      attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: 1000 }]),
    };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    INEFFA_KIT.elementalBurst.onStart?.(context);
    const swapTo = (characterId: number, previousCharacterId: number) =>
      INEFFA_KIT.onKitEvent?.(
        { characterId, kind: KitEventKind.CharacterSwapped, previousCharacterId },
        context,
        combatant,
      );
    const holders = (): number[] =>
      kitEffectState.effects
        .filter((effect) => effect.kind === "buff" && effect.source === PERMUTATION_SOURCE)
        .map((effect) => effect.characterId);

    swapTo(OTHER_CHARACTER_ID, INEFFA_CHARACTER_ID);
    expect(holders()).toStrictEqual([INEFFA_CHARACTER_ID, OTHER_CHARACTER_ID]);

    swapTo(INEFFA_CHARACTER_ID, OTHER_CHARACTER_ID);
    expect(holders()).toStrictEqual([INEFFA_CHARACTER_ID]);
  });
});
