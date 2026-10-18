import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import type { Combatant } from "#src/models/kit/Combatant";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { CLORINDE_CHARACTER_ID, createClorindeKitBehaviour } from "#src/services/kit/characters/clorindeKit";
import { castKitAction } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const CLORINDE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CLORINDE_CHARACTER_ID);

const createClorindeCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: CLORINDE_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: CLORINDE_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

describe(createClorindeKitBehaviour, () => {
  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(CLORINDE_KIT.elementalSkill, createClorindeCombatant(6));

    expect(
      kitEffectState.effects.find((effect) => effect.kind === "buff" && effect.attribute === Attribute.CriticalRate),
    ).toStrictEqual({
      amount: 0.1,
      attribute: Attribute.CriticalRate,
      characterId: CLORINDE_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 12,
    });
    expect(
      kitEffectState.effects.find((effect) => effect.kind === "buff" && effect.attribute === Attribute.CriticalDamage),
    ).toStrictEqual({
      amount: 0.7,
      attribute: Attribute.CriticalDamage,
      characterId: CLORINDE_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 12,
    });
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(CLORINDE_KIT.elementalSkill, createClorindeCombatant(5));

    expect(kitEffectState.effects).toHaveLength(0);
  });

  test("reads the burst's cooldown and cost, the charged attack's stamina and the strikes' multipliers from her proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: CLORINDE_KIT.burstCooldownSeconds,
      burstEnergyCost: CLORINDE_KIT.burstEnergyCost,
      chargedAttackStamina: CLORINDE_KIT.chargedAttackStamina,
      fifthStrike: CLORINDE_KIT.normalAttacks[4]?.hits[0]?.talentMultiplier,
      multipliers: CLORINDE_KIT.normalAttacks.slice(0, 2).map(({ hits }) => hits[0]?.talentMultiplier),
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 20,
      fifthStrike: expect.closeTo(0.9001, 3),
      multipliers: [expect.closeTo(0.5406, 3), expect.closeTo(0.5163, 3)],
    });
  });

  test("lightfall strikes five times, the last at 121 frames within its 128-frame animation", () => {
    expect.hasAssertions();

    expect({
      hitCount: CLORINDE_KIT.elementalBurst.hits.length,
      lastHitmarkSeconds: CLORINDE_KIT.elementalBurst.hits.at(-1)?.hitmarkSeconds,
    }).toStrictEqual({ hitCount: 5, lastHitmarkSeconds: 121 / 60 });
  });
});
