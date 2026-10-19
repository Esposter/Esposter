import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createVaresaKitBehaviour, VARESA_CHARACTER_ID } from "#src/services/kit/characters/varesaKit";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readCharacterKitRecord } from "#src/services/kit/readCharacterKitRecord.test";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const VARESA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, VARESA_CHARACTER_ID);
const { record: varesaRecord, toParameter } = await readCharacterKitRecord(VARESA_CHARACTER_ID);

const createVaresaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: VARESA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: VARESA_KIT,
  level: 90,
});

describe(createVaresaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...VARESA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...VARESA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      VARESA_KIT.plungeCollision.talentMultiplier,
      takeOne(VARESA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(VARESA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(VARESA_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(VARESA_KIT.elementalBurst.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.467784, 0.40028, 0.563128, 0.8928, 0.745878, 1.49144, 1.862889, 0.7448, 3.4512,
    ]);
  });

  test("the three strikes hit at their hitmarks and end at their animation frames", () => {
    expect.hasAssertions();
    expect(
      VARESA_KIT.normalAttacks.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))),
    ).toStrictEqual(varesaRecord.normalAttacks.map(({ hits }) => hits.map(({ hitmarkFrames }) => hitmarkFrames)));
    expect(VARESA_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual(
      varesaRecord.normalAttacks.map(({ animationFrames }) => animationFrames),
    );
  });

  test("the charged attack hits at its record's hitmark of its animation, costing its record's stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(VARESA_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(
      takeOne(varesaRecord.chargedAttack.hits).hitmarkFrames,
    );
    expect(Math.round(VARESA_KIT.chargedAttack.seconds * 60)).toBe(varesaRecord.chargedAttack.animationFrames);
    expect(VARESA_KIT.chargedAttackStamina).toBe(toParameter(varesaRecord.chargedAttackStamina));
  });

  test("the skill has two charges, and its cooldown and the burst's cooldown and energy come from the record", () => {
    expect.hasAssertions();
    expect(VARESA_KIT.elementalSkillCharges).toBe(2);
    expect(VARESA_KIT.skillCooldownSeconds).toBe(toParameter(varesaRecord.skillCooldownSeconds));
    expect(VARESA_KIT.burstCooldownSeconds).toBe(toParameter(varesaRecord.burstCooldownSeconds));
    const { burstEnergyCost } = varesaRecord;
    assert(burstEnergyCost !== undefined);
    expect(VARESA_KIT.burstEnergyCost).toBe(toParameter(burstEnergyCost));
  });

  test("the plunges land at their record's hitmarks, and the collision at its record's", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(VARESA_KIT.lowPlunge.hits).hitmarkSeconds * 60)).toBe(
      takeOne(varesaRecord.plunges[KitPlunge.Low].hits).hitmarkFrames,
    );
    expect(Math.round(takeOne(VARESA_KIT.highPlunge.hits).hitmarkSeconds * 60)).toBe(
      takeOne(varesaRecord.plunges[KitPlunge.High].hits).hitmarkFrames,
    );
    expect(Math.round(VARESA_KIT.plungeCollision.hitmarkSeconds * 60)).toBe(varesaRecord.plungeCollision.hitmarkFrames);
  });

  test("the skill's press gains 20 Nightsoul points, which stop at 40", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVaresaCombatant());
    VARESA_KIT.elementalSkill.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(20);
    VARESA_KIT.elementalSkill.onStart?.(context);
    VARESA_KIT.elementalSkill.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(40);
  });

  test("the skill's press raises a generation event for each press that gains points", () => {
    expect.hasAssertions();
    const events: KitEvent[] = [];
    const combatant: Combatant = {
      ...createVaresaCombatant(),
      kit: {
        ...VARESA_KIT,
        onKitEvent: (event) => {
          events.push(event);
        },
      },
    };
    const context = createKitTestContext(combatant);
    VARESA_KIT.elementalSkill.onStart?.(context);
    VARESA_KIT.elementalSkill.onStart?.(context);
    VARESA_KIT.elementalSkill.onStart?.(context);
    expect(events).toStrictEqual([
      { characterId: VARESA_CHARACTER_ID, kind: KitEventKind.NightsoulPointsGained, points: 20 },
      { characterId: VARESA_CHARACTER_ID, kind: KitEventKind.NightsoulPointsGained, points: 20 },
    ]);
  });

  test("a plunge gains 25 Nightsoul points, and filling them to 40 enters the Blessing for 15 seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVaresaCombatant());
    VARESA_KIT.highPlunge.onStart?.(context);
    expect(checkHasKitStatus(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      false,
    );
    VARESA_KIT.lowPlunge.onStart?.(context);
    expect(checkHasKitStatus(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      true,
    );
    stepKitSeconds(context, 14.9);
    expect(checkHasKitStatus(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      true,
    );
    stepKitSeconds(context, 0.2);
    expect(
      findKitStatus(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
  });

  test("the burst fills her Nightsoul points to 40 and enters the Blessing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVaresaCombatant());
    VARESA_KIT.elementalBurst.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(40);
    expect(checkHasKitStatus(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      true,
    );
  });

  test("a burst inside the Nightsoul Blessing is the Fiery Passion Flying Kick, and one outside it is her burst", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVaresaCombatant());
    expect(VARESA_KIT.elementalBurstVariant?.checkIsActive(context)).toBe(false);
    VARESA_KIT.elementalBurst.onStart?.(context);
    expect(VARESA_KIT.elementalBurstVariant?.checkIsActive(context)).toBe(true);
  });

  test("the Fiery Passion Flying Kick lands at its record's hitmark of its animation, with Poise 150", () => {
    expect.hasAssertions();
    expect(
      VARESA_KIT.elementalBurstVariant?.action.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    ).toStrictEqual(varesaRecord.burstVariant?.hits.map(({ hitmarkFrames }) => hitmarkFrames));
    expect(VARESA_KIT.elementalBurstVariant?.action.hits.map(({ poiseDamage }) => poiseDamage)).toStrictEqual([150]);
    expect(Math.round((VARESA_KIT.elementalBurstVariant?.action.seconds ?? 0) * 60)).toBe(
      varesaRecord.burstVariant?.animationFrames,
    );
  });

  test("the Fiery Passion Flying Kick fills her Nightsoul points to 40, as her burst does", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVaresaCombatant());
    VARESA_KIT.elementalSkill.onStart?.(context);
    VARESA_KIT.elementalBurstVariant?.action.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(40);
  });
});
