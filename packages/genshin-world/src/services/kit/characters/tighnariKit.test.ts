import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createTighnariKit, TIGHNARI_CHARACTER_ID } from "#src/services/kit/characters/tighnariKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TIGHNARI_KIT = createTighnariKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TIGHNARI_CHARACTER_ID]));

const createTighnariCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: TIGHNARI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TIGHNARI_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

describe(createTighnariKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const castEffects = (action: KitAction): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({
      body: kitBody,
      combatant: createTighnariCombatant(),
      kitEffectState,
      party: createParty([TIGHNARI_CHARACTER_ID]),
    });
    return kitEffectState.effects;
  };
  const castSummon = (action: KitAction): KitSummon | undefined =>
    castEffects(action).find((effect): effect is KitSummon => effect.kind === "summon");

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...TIGHNARI_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(TIGHNARI_KIT.chargedAttack.hits).talentMultiplier,
      TIGHNARI_KIT.plungeCollision.talentMultiplier,
      takeOne(TIGHNARI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(TIGHNARI_KIT.highPlunge.hits).talentMultiplier,
      takeOne(TIGHNARI_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(castSummon(TIGHNARI_KIT.elementalBurst)?.hits ?? []).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.44634, 0.41968, 0.26445, 0.26445, 0.68628, 1.24, 0.568288, 1.136335, 1.419344, 1.496, 0.5562,
    ]);
  });

  test("the skill and burst cooldowns and the burst's energy cost come from the table", () => {
    expect.hasAssertions();

    expect(TIGHNARI_KIT.skillCooldownSeconds).toBe(12);
    expect(TIGHNARI_KIT.burstCooldownSeconds).toBe(12);
    expect(TIGHNARI_KIT.burstEnergyCost).toBe(40);
  });

  test("the fully charged arrow lands at 96 frames, 10 after its 86-frame hitmark", () => {
    expect.hasAssertions();

    expect(Math.round(takeOne(TIGHNARI_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(96);
  });

  test("the Tanglevine Shaft hits land from 112 frames, and its secondary's six from 147", () => {
    expect.hasAssertions();
    const hits = castSummon(TIGHNARI_KIT.elementalBurst)?.hits ?? [];
    const hitmarks = hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60));

    expect(hitmarks).toStrictEqual([112, 117, 120, 121, 126, 128, 147, 153, 160, 161, 171, 175]);
  });

  test("the Vijnana-Phala Mine hits 20 frames after it is cast", () => {
    expect.hasAssertions();

    expect(Math.round(takeOne(TIGHNARI_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(20);
  });
});
