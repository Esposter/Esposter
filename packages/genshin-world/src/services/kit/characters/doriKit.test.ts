import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createDoriKit, DORI_CHARACTER_ID } from "#src/services/kit/characters/doriKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const DORI_KIT = createDoriKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [DORI_CHARACTER_ID]));

const createDoriCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: DORI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: DORI_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

describe(createDoriKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const castEffects = (action: KitAction): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({
      body: kitBody,
      combatant: createDoriCombatant(),
      kitEffectState,
      party: createParty([DORI_CHARACTER_ID]),
    });
    return kitEffectState.effects;
  };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...DORI_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...DORI_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      DORI_KIT.plungeCollision.talentMultiplier,
      takeOne(DORI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(DORI_KIT.highPlunge.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.90214, 0.410736, 0.431204, 1.28398, 0.625455, 1.1309, 0.745878, 1.49144, 1.862889,
    ]);
  });

  test("the skill and burst cost, cooldown and duration come from the table", () => {
    expect.hasAssertions();

    expect(DORI_KIT.skillCooldownSeconds).toBe(9);
    expect(DORI_KIT.burstCooldownSeconds).toBe(20);
    expect(DORI_KIT.burstEnergyCost).toBe(80);
    expect(DORI_KIT.chargedAttack.staminaPerSecond).toBe(40);
  });

  test("the After-Sales Service Round's two hits land 46 and 59 frames after Troubleshooter Shot", () => {
    expect.hasAssertions();

    expect(DORI_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      26, 72, 85,
    ]);
  });

  test("the Connector ticks every 24 frames from 28 frames, 32 times, in the circle ahead of the body", () => {
    expect.hasAssertions();
    const field = castEffects(DORI_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");

    expect(field?.radius).toBe(10);
    expect(Math.round((field?.nextTickSeconds ?? 0) * 60)).toBe(28);
    expect(Math.round((field?.tickIntervalSeconds ?? 0) * 60)).toBe(24);
    expect(field?.centre).toStrictEqual({ x: 0, z: -5 });
  });
});
