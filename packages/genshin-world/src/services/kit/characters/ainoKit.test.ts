import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { AINO_CHARACTER_ID, createAinoKitBehaviour } from "#src/services/kit/characters/ainoKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const AINO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, AINO_CHARACTER_ID);
const AINO_ENEMY = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

const createAinoCombatant = (ascension: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: 100 }]),
  characterId: AINO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: AINO_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// The additive bonus the first water ball her burst drops adds to its base DMG, priced as the combatant stands
const getFirstWaterBallBonus = (combatant: Combatant): number => {
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState });
  AINO_KIT.elementalBurst.onStart?.(context);
  const { hit } = takeOne(stepKitTestEffects(20, context));
  return hit.additiveBaseDamageBonus?.(combatant) ?? 0;
};

// Strikes one of the skill's hits on the enemy, the kit taking the event as the party's kit does
const strikeSkillHit = (context: KitContext, hit: KitHit): void => {
  AINO_KIT.onKitEvent?.(
    {
      enemy: AINO_ENEMY,
      hit,
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker: context.activeCombatant,
    },
    context,
    context.activeCombatant,
  );
};

describe(createAinoKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and burst's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...AINO_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      AINO_KIT.chargedAttack.hits[0]?.talentMultiplier,
      AINO_KIT.plungeCollision.talentMultiplier,
      AINO_KIT.lowPlunge.hits[0]?.talentMultiplier,
      AINO_KIT.highPlunge.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.664986, 0.661916, 0.492165, 0.492165, 1.1309, 0.745878, 1.49144, 1.862889]);
  });

  test("her burst costs 50 energy and cools for 13.5 seconds, her skill cools for 10 seconds, and her charged attack costs 40 stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: AINO_KIT.burstCooldownSeconds,
      burstEnergyCost: AINO_KIT.burstEnergyCost,
      chargedAttackStamina: AINO_KIT.chargedAttackStamina,
      skillCooldownSeconds: AINO_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 13.5,
      burstEnergyCost: 50,
      chargedAttackStamina: 40,
      skillCooldownSeconds: 10,
    });
  });

  test("her three strikes hit at their hitmarks and cancel at their default frames, the third striking twice", () => {
    expect.hasAssertions();
    expect(
      AINO_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: [23], seconds: 48 },
      { hitmarkFrames: [20], seconds: 75 },
      { hitmarkFrames: [35, 43], seconds: 93 },
    ]);
  });

  test("her skill's two stages land at 15 and 33 frames, and her burst plays no hit of its own", () => {
    expect.hasAssertions();
    expect({
      burstHits: AINO_KIT.elementalBurst.hits,
      skillHitmarkFrames: AINO_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    }).toStrictEqual({ burstHits: [], skillHitmarkFrames: [15, 33] });
  });

  test("the Ascension 4 passive, Structured Power Booster, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(getFirstWaterBallBonus(createAinoCombatant(4))).toBeGreaterThan(0);
  });

  test("the Ascension 4 passive, Structured Power Booster, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getFirstWaterBallBonus(createAinoCombatant(3))).toBe(0);
  });
  describe("constellation 4's skill energy", () => {
    test("a Constellation 4 switch gives Aino 10 energy on a skill hit, once every 10 seconds", () => {
      expect.hasAssertions();
      const combatant = { ...createAinoCombatant(0), constellationCount: 4 };
      const party = createParty([AINO_CHARACTER_ID]);
      const context = createKitTestContext(combatant, { kitEffectState: { effects: [] }, party });
      const energy = (): number => getPartyMember(party, AINO_CHARACTER_ID).energy;
      const energies: number[] = [];
      strikeSkillHit(context, takeOne(AINO_KIT.elementalSkill.hits));
      energies.push(energy());
      strikeSkillHit(context, takeOne(AINO_KIT.elementalSkill.hits.slice(1)));
      energies.push(energy());
      stepKitTestEffects(10, context);
      strikeSkillHit(context, takeOne(AINO_KIT.elementalSkill.hits));
      energies.push(energy());

      expect(energies).toStrictEqual([10, 10, 20]);
    });

    test("a Constellation 3 switch gives Aino no energy on a skill hit", () => {
      expect.hasAssertions();
      const combatant = { ...createAinoCombatant(0), constellationCount: 3 };
      const party = createParty([AINO_CHARACTER_ID]);
      const context = createKitTestContext(combatant, { kitEffectState: { effects: [] }, party });
      strikeSkillHit(context, takeOne(AINO_KIT.elementalSkill.hits));

      expect(getPartyMember(party, AINO_CHARACTER_ID).energy).toBe(0);
    });
  });
});
