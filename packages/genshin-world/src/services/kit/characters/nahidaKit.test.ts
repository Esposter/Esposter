import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitField } from "#src/models/kit/KitField";
import type { KitRecord } from "#src/models/kit/record/KitRecord";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { GameDataset } from "#src/models/data/GameDataset";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { kitRecordSchema } from "#src/models/kit/record/KitRecord";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { COMBAT_TALENT_ORDER, TALENT_START_LEVELS } from "#src/services/character/constants";
import { readCharacterTalentKits } from "#src/services/character/readCharacterTalentKits";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { buildKit } from "#src/services/kit/buildKit";
import {
  createNahidaKitBehaviour,
  NAHIDA_CHARACTER_ID,
  SEEDS_OF_SKANDHA_STATUS_ID,
} from "#src/services/kit/characters/nahidaKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test, vi } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// Named entries the record holds for Tri-Karma Purification, Illusory Heart and the burst's per-count rows, read off the
// Skill and burst proud skill groups by the builder. The hosted record gains them once its kits are published
const NAHIDA_RECORD_NAMES: Partial<KitRecord> = {
  areas: { illusoryHeart: { angle: 2 * Math.PI, height: 2, radius: 20 } },
  frames: { illusoryHeartFirstTick: 96, illusoryHeartStart: 66, illusoryHeartTickInterval: 30 },
  hits: {
    triKarmaPurification: {
      area: { angle: 2 * Math.PI, height: 2, radius: 4.8 },
      element: Element.Dendro,
      gauge: 1,
      hitmarkFrames: 3,
      multiplier: { index: 2, proudSkillGroupId: 7332 },
      poiseDamage: 0,
    },
  },
  parameters: {
    illusoryHeartHydroExtension: [
      { index: 4, proudSkillGroupId: 7339 },
      { index: 5, proudSkillGroupId: 7339 },
    ],
    illusoryHeartSeconds: 15,
    triKarmaElectroIntervalCut: [
      { index: 2, proudSkillGroupId: 7339 },
      { index: 3, proudSkillGroupId: 7339 },
    ],
    triKarmaElementalMastery: { index: 3, proudSkillGroupId: 7332 },
    triKarmaPyroDamageBonus: [
      { index: 0, proudSkillGroupId: 7339 },
      { index: 1, proudSkillGroupId: 7339 },
    ],
  },
};
const createNahidaKit = async (): Promise<Kit> => {
  const [record, talentMultiplierMap, characterTalentKits] = await Promise.all([
    readGameDataEntry(GAME_DATA_LOCAL_BASE_URL, GameDataset.Kits, String(NAHIDA_CHARACTER_ID), kitRecordSchema),
    readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [NAHIDA_CHARACTER_ID]),
    readCharacterTalentKits(GAME_DATA_LOCAL_BASE_URL),
  ]);
  const talentGroupIds = characterTalentKits.find(
    ({ characterId }) => characterId === NAHIDA_CHARACTER_ID,
  )?.talentGroupIds;
  if (!talentGroupIds) throw new Error("Nahida has no talent groups");
  const talentLevelMap = Object.fromEntries(
    COMBAT_TALENT_ORDER.map((talent) => [talentGroupIds[talent], TALENT_START_LEVELS[talent]]),
  );
  return buildKit({ ...record, ...NAHIDA_RECORD_NAMES }, talentMultiplierMap, talentLevelMap, createNahidaKitBehaviour);
};
const KIT = await createNahidaKit();
// The kit the four original tests read, the same kit the new ones build
const NAHIDA_KIT = KIT;
const createCombatant = (characterId: number, element: Element, elementMastery = 0, kit: Kit = KIT): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementMastery }]),
  characterId,
  constellationCount: 0,
  element,
  elementalResonances: [],
  kit,
  level: 90,
});
const createEnemyAt = (id: string) =>
  createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, id, position: { x: 0, z: 0 } }, "");
const hasSeeds = (enemy: { statuses: { id: string }[] }) =>
  enemy.statuses.some(({ id }) => id === SEEDS_OF_SKANDHA_STATUS_ID);
const getField = (effects: readonly { kind: string }[]) =>
  effects.find((effect): effect is KitField => effect.kind === "field");

describe(createNahidaKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and skill's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NAHIDA_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      NAHIDA_KIT.chargedAttack.hits[0]?.talentMultiplier,
      NAHIDA_KIT.plungeCollision.talentMultiplier,
      NAHIDA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      NAHIDA_KIT.highPlunge.hits[0]?.talentMultiplier,
      NAHIDA_KIT.elementalSkill.hits[0]?.talentMultiplier,
      NAHIDA_KIT.elementalSkillHolds?.[0]?.action.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.403048, 0.369744, 0.458744, 0.584064, 1.32, 0.568288, 1.136335, 1.419344, 0.984, 1.304,
    ]);
  });

  test("the charged attack costs 50 stamina, her burst costs 50 energy and cools for 13.5 seconds, and her skill cools for 5 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: NAHIDA_KIT.burstCooldownSeconds,
      burstEnergyCost: NAHIDA_KIT.burstEnergyCost,
      chargedAttackStamina: NAHIDA_KIT.chargedAttackStamina,
      skillCooldownSeconds: NAHIDA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 13.5,
      burstEnergyCost: 50,
      chargedAttackStamina: 50,
      skillCooldownSeconds: 5,
    });
  });

  test("her four strikes hit at their hitmarks and cancel at their default frames", () => {
    expect.hasAssertions();
    expect(
      NAHIDA_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: 23, seconds: 35 },
      { hitmarkFrames: 15, seconds: 31 },
      { hitmarkFrames: 26, seconds: 45 },
      { hitmarkFrames: 40, seconds: 71 },
    ]);
  });

  test("all Schemes to Know's press hits at 13 frames, and its full hold at 332 frames with a six-second cooldown", () => {
    expect.hasAssertions();
    const hold = NAHIDA_KIT.elementalSkillHolds?.[0];
    expect({
      holdCooldownSeconds: hold?.cooldownSeconds,
      holdHitmarkFrames: Math.round((hold?.action.hits[0]?.hitmarkSeconds ?? 0) * 60),
      minimumHeldSeconds: hold?.minimumHeldSeconds,
      pressHitmarkFrames: Math.round((NAHIDA_KIT.elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({ holdCooldownSeconds: 6, holdHitmarkFrames: 332, minimumHeldSeconds: 5, pressHitmarkFrames: 13 });
  });
});

describe("seeds of Skandha", () => {
  test("a cast's press marks each enemy it strikes", () => {
    expect.hasAssertions();
    const combatant = createCombatant(NAHIDA_CHARACTER_ID, Element.Dendro);
    const context = createKitTestContext(combatant);
    const enemies = [createEnemyAt("first"), createEnemyAt("second")];
    KIT.elementalSkill.onStart?.(context);
    for (const enemy of enemies) {
      const strike: KitStrike = { body: context.body, combatant, hit: KIT.elementalSkill.hits[0] };
      KIT.elementalSkill.hits[0].onStrike?.(context, strike, enemy);
    }

    expect(enemies.map((enemy) => hasSeeds(enemy))).toStrictEqual([true, true]);
  });

  test("a cast marks at most eight enemies, and the next cast marks again", () => {
    expect.hasAssertions();
    const combatant = createCombatant(NAHIDA_CHARACTER_ID, Element.Dendro);
    const context = createKitTestContext(combatant);
    const enemies = Array.from({ length: 9 }, (_, index) => createEnemyAt(`enemy-${index}`));
    const strikeEach = (struck: readonly ReturnType<typeof createEnemyAt>[]) => {
      for (const enemy of struck) {
        const strike: KitStrike = { body: context.body, combatant, hit: KIT.elementalSkill.hits[0] };
        KIT.elementalSkill.hits[0].onStrike?.(context, strike, enemy);
      }
    };
    KIT.elementalSkill.onStart?.(context);
    strikeEach(enemies);
    const markedInFirstCast = enemies.filter((enemy) => hasSeeds(enemy)).length;
    KIT.elementalSkill.onStart?.(context);
    strikeEach(enemies.slice(8));

    expect({ markedInFirstCast, markedInSecondCast: enemies.filter((enemy) => hasSeeds(enemy)).length }).toStrictEqual({
      markedInFirstCast: 8,
      markedInSecondCast: 9,
    });
  });
});

describe("tri-Karma Purification", () => {
  test("a reaction on a marked enemy strikes every marked enemy, and a reaction on an unmarked one strikes nothing", () => {
    expect.hasAssertions();
    const combatant = createCombatant(NAHIDA_CHARACTER_ID, Element.Dendro);
    const context = createKitTestContext(combatant);
    const marked = [createEnemyAt("marked-a"), createEnemyAt("marked-b")];
    const unmarked = createEnemyAt("unmarked");
    KIT.elementalSkill.onStart?.(context);
    for (const enemy of marked) {
      const strike: KitStrike = { body: context.body, combatant, hit: KIT.elementalSkill.hits[0] };
      KIT.elementalSkill.hits[0].onStrike?.(context, strike, enemy);
    }
    context.enemyMap.set(unmarked.id, unmarked);
    for (const enemy of marked) context.enemyMap.set(enemy.id, enemy);
    KIT.onKitEvent?.(
      { enemy: unmarked, kind: KitEventKind.ReactionTriggered, reactions: [], striker: combatant },
      context,
      combatant,
    );
    const unmarkedStrikes = context.strikes.length;
    KIT.onKitEvent?.(
      { enemy: marked[0], kind: KitEventKind.ReactionTriggered, reactions: [], striker: combatant },
      context,
      combatant,
    );

    expect({ strikesFromUnmarked: unmarkedStrikes, struck: context.strikes.map(({ target }) => target) }).toStrictEqual(
      { strikesFromUnmarked: 0, struck: marked },
    );
  });

  test("the clock runs 2.5 seconds, and inside Illusory Heart's window the Electro count cuts it", () => {
    expect.hasAssertions();
    const combatant = createCombatant(NAHIDA_CHARACTER_ID, Element.Dendro);
    const teammate = createCombatant(10_000_001, Element.Electro);
    const createTeamContext = () =>
      createKitTestContext(combatant, {
        characterIdCombatantMap: new Map([
          [NAHIDA_CHARACTER_ID, combatant],
          [teammate.characterId, teammate],
        ]),
        party: createParty([NAHIDA_CHARACTER_ID, teammate.characterId]),
      });
    const enemy = createEnemyAt("marked");
    const react = (context: ReturnType<typeof createKitTestContext>) =>
      KIT.onKitEvent?.(
        { enemy, kind: KitEventKind.ReactionTriggered, reactions: [], striker: combatant },
        context,
        combatant,
      );
    const outside = createTeamContext();
    KIT.elementalSkill.onStart?.(outside);
    KIT.elementalSkill.hits[0].onStrike?.(
      outside,
      { body: outside.body, combatant, hit: KIT.elementalSkill.hits[0] },
      enemy,
    );
    react(outside);
    const inside = createTeamContext();
    KIT.elementalSkill.onStart?.(inside);
    KIT.elementalSkill.hits[0].onStrike?.(
      inside,
      { body: inside.body, combatant, hit: KIT.elementalSkill.hits[0] },
      enemy,
    );
    KIT.elementalBurst.onStart?.(inside);
    getField(inside.kitEffectState.effects)?.onTick(inside, 0);
    react(inside);

    expect({
      insideWindow: findKitStatus(inside.kitEffectState.effects, NAHIDA_CHARACTER_ID, "nahida-tri-karma-clock")
        ?.secondsRemaining,
      outsideWindow: findKitStatus(outside.kitEffectState.effects, NAHIDA_CHARACTER_ID, "nahida-tri-karma-clock")
        ?.secondsRemaining,
    }).toStrictEqual({ insideWindow: 136 / 60, outsideWindow: 2.5 });
  });

  test("the Elemental Mastery scale of Tri-Karma Purification, and takes the Pyro bonus inside Illusory Heart's window", () => {
    expect.hasAssertions();
    const combatant = createCombatant(NAHIDA_CHARACTER_ID, Element.Dendro, 1000);
    const teammate = createCombatant(10_000_002, Element.Pyro);
    const enemy = createEnemyAt("marked");
    const context = createKitTestContext(combatant, {
      characterIdCombatantMap: new Map([
        [NAHIDA_CHARACTER_ID, combatant],
        [teammate.characterId, teammate],
      ]),
      enemyMap: new Map([[enemy.id, enemy]]),
      party: createParty([NAHIDA_CHARACTER_ID, teammate.characterId]),
    });
    KIT.elementalSkill.onStart?.(context);
    KIT.elementalSkill.hits[0].onStrike?.(
      context,
      { body: context.body, combatant, hit: KIT.elementalSkill.hits[0] },
      enemy,
    );
    KIT.elementalBurst.onStart?.(context);
    getField(context.kitEffectState.effects)?.onTick(context, 0);
    KIT.onKitEvent?.(
      { enemy, kind: KitEventKind.ReactionTriggered, reactions: [], striker: combatant },
      context,
      combatant,
    );
    const [strike] = context.strikes;

    expect({
      elementalMasteryDamage: strike?.hit.additiveBaseDamageBonus?.(combatant),
      pyroBonus: strike?.hit.damageBonus,
    }).toStrictEqual({ elementalMasteryDamage: 1000 * 2.064, pyroBonus: 0.1488 });
  });

  test("the first Tri-Karma Purification strike gives Dendro particles, and none again for seven seconds", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = createCombatant(NAHIDA_CHARACTER_ID, Element.Dendro, 0, {
      ...KIT,
      onKitEvent: (event, context, self) => {
        onKitEvent(event, context, self);
        KIT.onKitEvent?.(event, context, self);
      },
    });
    const context = createKitTestContext(combatant);
    const enemy = createEnemyAt("marked");
    const react = () =>
      KIT.onKitEvent?.(
        { enemy, kind: KitEventKind.ReactionTriggered, reactions: [], striker: combatant },
        context,
        combatant,
      );
    const particleEvents = () =>
      onKitEvent.mock.calls.filter(([event]) => event.kind === KitEventKind.EnergyParticleCollected).length;
    KIT.elementalSkill.onStart?.(context);
    KIT.elementalSkill.hits[0].onStrike?.(
      context,
      { body: context.body, combatant, hit: KIT.elementalSkill.hits[0] },
      enemy,
    );
    react();
    const first = particleEvents();
    stepKitSeconds(context, 2.5);
    react();
    const withinSevenSeconds = particleEvents();
    stepKitSeconds(context, 5);
    react();

    expect({ first, withinSevenSeconds, afterSevenSeconds: particleEvents() }).toStrictEqual({
      afterSevenSeconds: 2,
      first: 1,
      withinSevenSeconds: 1,
    });
  });
});

describe("illusory Heart's field", () => {
  test("the field lasts 15 seconds plus the Hydro count's extension, with a radius of 20 metres", () => {
    expect.hasAssertions();
    const combatant = createCombatant(NAHIDA_CHARACTER_ID, Element.Dendro);
    const teammate = createCombatant(10_000_003, Element.Hydro);
    const context = createKitTestContext(combatant, {
      characterIdCombatantMap: new Map([
        [NAHIDA_CHARACTER_ID, combatant],
        [teammate.characterId, teammate],
      ]),
      party: createParty([NAHIDA_CHARACTER_ID, teammate.characterId]),
    });
    KIT.elementalBurst.onStart?.(context);
    const field = getField(context.kitEffectState.effects);

    expect(field?.radius).toBe(20);
    expect(field?.secondsRemaining).toBeCloseTo(66 / 60 + 15 + 3.344, 9);
  });

  test("a tick with Nahida's body inside opens a one-second window for Tri-Karma Purification", () => {
    expect.hasAssertions();
    const combatant = createCombatant(NAHIDA_CHARACTER_ID, Element.Dendro);
    const context = createKitTestContext(combatant);
    KIT.elementalBurst.onStart?.(context);
    getField(context.kitEffectState.effects)?.onTick(context, 0);
    const window = findKitStatus(context.kitEffectState.effects, NAHIDA_CHARACTER_ID, "nahida-illusory-heart-within");

    expect(window?.secondsRemaining).toBe(1);
  });
});
