import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { AINO_CHARACTER_ID, createAinoKitBehaviour } from "#src/services/kit/characters/ainoKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
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

// Two other members whose kits hold a Moonsign Benediction, declared here, to make a team at Ascendant Gleam with her
const MOONSIGN_KIT: Kit = { ...AINO_KIT, moonsignBenediction: { lunarReactionTypes: [] } };
const MOONSIGN_CHARACTER_IDS = [1, 2];
const ASCENDANT_TEAM = [AINO_CHARACTER_ID, ...MOONSIGN_CHARACTER_IDS];

// Casts the burst at the ascension in the team the characters make, and returns its field with the context it was cast in
const castBurstInTeam = (ascension: number, characterIds: number[]) => {
  const combatant = createAinoCombatant(ascension);
  const characterIdCombatantMap = new Map<number, Combatant>(
    characterIds.map((characterId): [number, Combatant] => [
      characterId,
      characterId === AINO_CHARACTER_ID ? combatant : { ...combatant, characterId, kit: MOONSIGN_KIT },
    ]),
  );
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, {
    characterIdCombatantMap,
    kitEffectState,
    party: createParty(characterIds),
  });
  AINO_KIT.elementalBurst.onStart?.(context);
  const [field] = kitEffectState.effects as KitField[];
  return { context, field, kitEffectState };
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

// Aino's burst is cast with a teammate in the team, and the teammate is the one on the field: the context her kit reads
// The teammate's hits in, with the zone the burst left standing
const createTeammateTeam = (constellationCount: number) => {
  const aino = { ...createAinoCombatant(0), constellationCount };
  const teammate = { ...aino, characterId: takeOne(MOONSIGN_CHARACTER_IDS) };
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(aino, {
    characterIdCombatantMap: new Map<number, Combatant>([
      [aino.characterId, aino],
      [teammate.characterId, teammate],
    ]),
    kitEffectState,
    party: createParty([AINO_CHARACTER_ID, teammate.characterId]),
  });
  AINO_KIT.elementalBurst.onStart?.(context);
  return { aino, context: { ...context, activeCombatant: teammate }, kitEffectState, teammate };
};
// The kit reads a hit of the striker's on the enemy, as the party's kits take each event
const strikeEnemy = (context: KitContext, striker: Combatant, combatant: Combatant): void => {
  AINO_KIT.onKitEvent?.(
    {
      enemy: AINO_ENEMY,
      hit: takeOne(AINO_KIT.elementalSkill.hits),
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker,
    },
    context,
    combatant,
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

  test("at Ascension 1 with the team at Ascendant Gleam, her burst's balls fall every 0.7 seconds", () => {
    expect.hasAssertions();
    expect(castBurstInTeam(1, ASCENDANT_TEAM).field?.tickIntervalSeconds).toBeCloseTo(0.7);
  });

  test("at Ascension 1 with the team at Ascendant Gleam, a Water Ball lands with a reach of fourteen metres", () => {
    expect.hasAssertions();
    const { context, field, kitEffectState } = castBurstInTeam(1, ASCENDANT_TEAM);
    field?.onTick(context, 0);
    const summon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
    expect(summon?.hits[0]?.hitArea.radius).toBe(14);
  });

  test("a Water Ball's hitmark counts from the tick that drops it, ten frames on, not from the burst's start", () => {
    expect.hasAssertions();

    const { context, kitEffectState } = castBurstInTeam(0, [AINO_CHARACTER_ID]);

    // The first tick drops the first ball at its first tick's seconds, so the ball lands ten frames on from its drop
    stepKitTestEffects(2.1, context);
    const [summon] = kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon");
    expect(summon?.hits[0]?.hitmarkSeconds).toBeCloseTo(10 / 60);
  });

  test("below Ascendant Gleam or below Ascension 1, her burst keeps the base beat", () => {
    expect.hasAssertions();
    expect(castBurstInTeam(0, ASCENDANT_TEAM).field?.tickIntervalSeconds).toBeCloseTo(1.5);
    expect(castBurstInTeam(1, [AINO_CHARACTER_ID]).field?.tickIntervalSeconds).toBeCloseTo(1.5);
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

  describe("constellation 2's water ball", () => {
    test("an active constellation's switch queues a water ball on an enemy the active member hits while Aino is off the field", () => {
      expect.hasAssertions();
      const { aino, context, teammate } = createTeammateTeam(2);
      strikeEnemy(context, teammate, aino);

      expect(context.strikes.map(({ target }) => target)).toStrictEqual([AINO_ENEMY]);
    });

    test("an inactive constellation changes nothing", () => {
      expect.hasAssertions();
      const { aino, context, teammate } = createTeammateTeam(1);
      strikeEnemy(context, teammate, aino);

      expect(context.strikes).toHaveLength(0);
    });

    test("the water ball queues nothing while Aino is on the field", () => {
      expect.hasAssertions();
      const { aino, context, teammate } = createTeammateTeam(2);
      const onField = { ...context, activeCombatant: aino };
      strikeEnemy(onField, aino, aino);
      strikeEnemy(onField, teammate, aino);

      expect(context.strikes).toHaveLength(0);
    });

    test("the water ball queues nothing once her burst's zone has run out", () => {
      expect.hasAssertions();
      const { aino, context, kitEffectState, teammate } = createTeammateTeam(2);
      for (const effect of kitEffectState.effects) if (effect.kind === "field") effect.secondsRemaining = 0;
      strikeEnemy(context, teammate, aino);

      expect(context.strikes).toHaveLength(0);
    });

    test("the water ball fires once every five seconds", () => {
      expect.hasAssertions();
      const { aino, context, teammate } = createTeammateTeam(2);
      // A step clears the strikes queued before it, so each read counts the balls queued on the enemy since the last step
      const countQueuedBalls = (): number => context.strikes.filter(({ target }) => target === AINO_ENEMY).length;
      strikeEnemy(context, teammate, aino);
      strikeEnemy(context, teammate, aino);
      const countBeforeCooldown = countQueuedBalls();
      stepKitSeconds(context, 4);
      strikeEnemy(context, teammate, aino);
      const countWhileCoolingDown = countQueuedBalls();
      // Five steps of a sixtieth of a second leave the cooldown a sliver above zero, so the ball is read once a step past five
      stepKitSeconds(context, 1 + FIXED_STEP_SECONDS);
      strikeEnemy(context, teammate, aino);

      expect([countBeforeCooldown, countWhileCoolingDown, countQueuedBalls()]).toStrictEqual([1, 0, 1]);
    });
  });
});
