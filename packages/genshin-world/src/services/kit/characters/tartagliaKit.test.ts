import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEventContext } from "#src/models/kit/KitEventContext";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TARTAGLIA_CHARACTER_ID, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createTartagliaKit } from "#src/services/kit/characters/tartagliaKit";
import { createKitEventContext } from "#src/services/kit/createKitEventContext.test";
import { getStancedKit } from "#src/services/kit/effects/getStancedKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TARTAGLIA_KIT = createTartagliaKit(
  await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TARTAGLIA_CHARACTER_ID]),
);

const createTartagliaCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: TARTAGLIA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: TARTAGLIA_KIT,
  level: 90,
});

// The multipliers of the hits the summons on the team land
const readStrikeMultipliers = ({ kitEffectState }: KitEventContext): number[] =>
  kitEffectState.effects.flatMap((effect) =>
    effect.kind === "summon" ? effect.hits.map(({ talentMultiplier }) => talentMultiplier) : [],
  );

describe(createTartagliaKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // The team's effects once the skill's press has changed into the Melee Stance, and the kit that stance plays
  const enterMeleeStance = (combatant: Combatant): { kitEffectState: KitEffectState; stance?: KitStance } => {
    const kitEffectState: KitEffectState = { effects: [] };
    TARTAGLIA_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    return {
      kitEffectState,
      stance: kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance"),
    };
  };
  const meleeKit = getStancedKit(
    TARTAGLIA_KIT,
    enterMeleeStance(createTartagliaCombatant()).kitEffectState.effects,
    TARTAGLIA_CHARACTER_ID,
  );
  const createDamageTaken = (enemy: Enemy, event: Partial<KitDamageTakenEvent>): KitDamageTakenEvent => ({
    enemy,
    hit: takeOne(TARTAGLIA_KIT.chargedAttack.hits),
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken,
    striker: createTartagliaCombatant(),
    ...event,
  });

  test("reads each talent multiplier from its proud skill groups, in both stances", () => {
    expect.hasAssertions();
    const stanceEffects = enterMeleeStance(createTartagliaCombatant()).kitEffectState.effects;
    const rangedBurstEffectState: KitEffectState = { effects: [] };
    TARTAGLIA_KIT.elementalBurst.onStart?.({
      body: kitBody,
      combatant: createTartagliaCombatant(),
      kitEffectState: rangedBurstEffectState,
    });
    const multipliers = [
      ...TARTAGLIA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(TARTAGLIA_KIT.chargedAttack.hits).talentMultiplier,
      TARTAGLIA_KIT.plungeCollision.talentMultiplier,
      takeOne(TARTAGLIA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(TARTAGLIA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(TARTAGLIA_KIT.elementalSkill.hits).talentMultiplier,
      ...meleeKit.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...meleeKit.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      takeOne(meleeKit.elementalBurst.hits).talentMultiplier,
      ...rangedBurstEffectState.effects.flatMap((effect) =>
        effect.kind === "summon" ? effect.hits.map(({ talentMultiplier }) => talentMultiplier) : [],
      ),
    ];

    expect(stanceEffects.map(({ kind }) => kind)).toStrictEqual(["stance"]);
    expect(multipliers).toStrictEqual([
      0.4128, 0.46268, 0.55384, 0.57018, 0.60888, 0.72756, 1.24, 0.639324, 1.278377, 1.596762, 0.72, 0.38872, 0.41624,
      0.5633, 0.59942, 0.55298, 0.35432, 0.37668, 0.602, 0.71982, 4.64, 3.784,
    ]);
    expect(meleeKit.chargedAttackStamina).toBe(20);
  });

  test("the press holds the Melee Stance for its 30 seconds, and a press back ends it", () => {
    expect.hasAssertions();
    const combatant = createTartagliaCombatant();
    const { kitEffectState, stance } = enterMeleeStance(combatant);

    expect(stance?.secondsRemaining).toBe(30);

    meleeKit.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });

    expect(stance?.secondsRemaining).toBe(0);
  });

  test.each([
    [10.5, 0, 16],
    [30.1, 0, 45],
    [10.5, 1, 12.8],
  ])(
    "a stance held %s seconds from %s constellations ends on a cooldown of %s seconds",
    (heldSeconds, count, cooldown) => {
      expect.hasAssertions();
      const combatant = createTartagliaCombatant(0, count);
      const { kitEffectState, stance } = enterMeleeStance(combatant);
      const context = createKitEventContext(combatant, { kitEffectState });
      if (stance) {
        stance.elapsedSeconds = heldSeconds;
        TARTAGLIA_KIT.onKitEvent?.({ effect: stance, kind: KitEventKind.EffectExpired }, context);
      }

      expect(getPartyMember(context.party, TARTAGLIA_CHARACTER_ID).skillCooldownSeconds).toBeCloseTo(cooldown);
    },
  );

  test("a swap ends the Melee Stance, and six constellations' burst in it ends the stance's cooldown as it ends", () => {
    expect.hasAssertions();
    const combatant = createTartagliaCombatant(0, 6);
    const { kitEffectState, stance } = enterMeleeStance(combatant);
    const context = createKitEventContext(combatant, { kitEffectState });
    getPartyMember(context.party, TARTAGLIA_CHARACTER_ID).skillCooldownSeconds = 1;
    meleeKit.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
    TARTAGLIA_KIT.onKitEvent?.(
      {
        characterId: TRAVELER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: TARTAGLIA_CHARACTER_ID,
      },
      context,
    );
    if (stance) TARTAGLIA_KIT.onKitEvent?.({ effect: stance, kind: KitEventKind.EffectExpired }, context);

    expect(stance?.secondsRemaining).toBe(0);
    expect(getPartyMember(context.party, TARTAGLIA_CHARACTER_ID).skillCooldownSeconds).toBe(0);
  });

  test("a fully charged aimed shot gives Riptide, and on Riptide it held sets off Riptide Flash once in 0.7 seconds", () => {
    expect.hasAssertions();
    const context = createKitEventContext(createTartagliaCombatant(1));
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const aimedShot = createDamageTaken(enemy, { attackTag: AttackTag.ChargedAttack });
    TARTAGLIA_KIT.onKitEvent?.(aimedShot, context);

    expect(enemy.statuses.map(({ secondsRemaining }) => secondsRemaining)).toStrictEqual([18]);
    expect(readStrikeMultipliers(context)).toStrictEqual([]);

    TARTAGLIA_KIT.onKitEvent?.(aimedShot, context);
    TARTAGLIA_KIT.onKitEvent?.(aimedShot, context);

    expect(readStrikeMultipliers(context)).toStrictEqual([0.124, 0.124, 0.124]);
  });

  test("a Melee Stance hit sets off Riptide Slash on Riptide once in 1.5 seconds, its CRIT hit giving Riptide from ascension 4", () => {
    expect.hasAssertions();
    const combatant = createTartagliaCombatant(4);
    const context = createKitEventContext(combatant, { kitEffectState: enterMeleeStance(combatant).kitEffectState });
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const strike = (isCritical: boolean): void =>
      TARTAGLIA_KIT.onKitEvent?.(
        createDamageTaken(enemy, {
          attackTag: AttackTag.NormalAttack,
          hit: takeOne(takeOne(meleeKit.normalAttacks).hits),
          isCritical,
          striker: combatant,
        }),
        context,
      );
    strike(false);

    expect(readStrikeMultipliers(context)).toStrictEqual([]);

    strike(true);
    strike(true);

    expect(readStrikeMultipliers(context)).toStrictEqual([0.602]);
  });

  test("the Melee Stance's burst hit on Riptide clears it and sets off Riptide Blast 0.8 seconds on", () => {
    expect.hasAssertions();
    const context = createKitEventContext(createTartagliaCombatant());
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    TARTAGLIA_KIT.onKitEvent?.(createDamageTaken(enemy, { attackTag: AttackTag.ChargedAttack }), context);
    TARTAGLIA_KIT.onKitEvent?.(
      createDamageTaken(enemy, { attackTag: AttackTag.ElementalBurst, hit: takeOne(meleeKit.elementalBurst.hits) }),
      context,
    );
    const blast = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(enemy.statuses).toStrictEqual([]);
    expect(blast?.hits.map(({ hitmarkSeconds, talentMultiplier }) => [hitmarkSeconds, talentMultiplier])).toStrictEqual(
      [[0.8, 1.2]],
    );
  });

  test("an enemy defeated holding Riptide bursts, giving 4 energy from two constellations, whoever defeated it", () => {
    expect.hasAssertions();
    const context = createKitEventContext(createTartagliaCombatant(0, 2));
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    TARTAGLIA_KIT.onKitEvent?.(createDamageTaken(enemy, { attackTag: AttackTag.ChargedAttack }), context);
    TARTAGLIA_KIT.onKitEvent?.(
      createDamageTaken(enemy, {
        hit: TARTAGLIA_KIT.plungeCollision,
        isDefeated: true,
        striker: { ...createTartagliaCombatant(), characterId: TRAVELER_CHARACTER_ID },
      }),
      context,
    );

    expect(readStrikeMultipliers(context)).toStrictEqual([0.62]);
    expect(getPartyMember(context.party, TARTAGLIA_CHARACTER_ID).energy).toBe(4);
  });

  test("four constellations tick Riptide every 3.9 seconds, each tick a Riptide Flash out of the Melee Stance", () => {
    expect.hasAssertions();
    const context = createKitEventContext(createTartagliaCombatant(0, 4));
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    TARTAGLIA_KIT.onKitEvent?.(createDamageTaken(enemy, { attackTag: AttackTag.ChargedAttack }), context);
    const [riptide] = enemy.statuses;
    if (riptide) TARTAGLIA_KIT.onKitEvent?.({ enemy, kind: KitEventKind.StatusTicked, status: riptide }, context);
    const flash = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(riptide?.tickIntervalSeconds).toBe(3.9);
    expect(flash?.hits.map(({ poiseDamage }) => poiseDamage)).toStrictEqual([15, 15, 15]);
  });

  test("the ranged burst lands Flash of Havoc on the enemy turned to and gives 20 energy back 4 frames on", () => {
    expect.hasAssertions();
    const combatant = createTartagliaCombatant();
    const context = createKitEventContext(combatant);
    const target = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), position: { x: 0, z: -9 } };
    TARTAGLIA_KIT.elementalBurst.onStart?.({
      body: kitBody,
      combatant,
      kitEffectState: context.kitEffectState,
      target,
    });
    const flashOfHavoc = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
    stepKitEffects(context.kitEffectState, 4 / 60, {
      activeCombatant: combatant,
      body: kitBody.position,
      party: context.party,
    });

    expect(flashOfHavoc?.body.position).toStrictEqual({ x: 0, z: -9 });
    expect(getPartyMember(context.party, TARTAGLIA_CHARACTER_ID).energy).toBe(20);
  });

  test("the skill's cooldown, the burst's cooldown and energy cost come from gcsim and the dump's groups", () => {
    expect.hasAssertions();

    expect(TARTAGLIA_KIT.skillCooldownSeconds).toBe(1);
    expect(TARTAGLIA_KIT.burstCooldownSeconds).toBe(15);
    expect(TARTAGLIA_KIT.burstEnergyCost).toBe(60);
  });
});
