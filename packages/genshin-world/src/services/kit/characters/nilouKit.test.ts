import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { DendroCoreKind } from "#src/models/kit/DendroCoreKind";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { ALHAITHAM_CHARACTER_ID } from "#src/services/kit/characters/alhaithamKit";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { KUKI_CHARACTER_ID } from "#src/services/kit/characters/kukiKit";
import { createNilouKitBehaviour, NILOU_CHARACTER_ID } from "#src/services/kit/characters/nilouKit";
import { YELAN_CHARACTER_ID } from "#src/services/kit/characters/yelanKit";
import { createKitBody } from "#src/services/kit/createKitBody";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { GOLDEN_CHALICE_BOUNTY_STATUS_ID } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const NILOU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NILOU_CHARACTER_ID);
const findStance = (kitEffectState: KitEffectState): KitStance | undefined =>
  kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance");
const findField = (kitEffectState: KitEffectState): KitField | undefined =>
  kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
// The statuses and buffs the team's effects hold, in the order they were added
const findStatuses = (kitEffectState: KitEffectState) => kitEffectState.effects.filter(({ kind }) => kind === "status");
const findBuffs = (kitEffectState: KitEffectState) => kitEffectState.effects.filter(({ kind }) => kind === "buff");

// The team Nilou leads on the field, its members in the order given, and the context its effects run in
const createTeamContext = (combatant: Combatant, members: Combatant[]): KitContext => {
  const combatants = [combatant, ...members];
  return createKitTestContext(combatant, {
    characterIdCombatantMap: new Map(combatants.map((member) => [member.characterId, member])),
    kitEffectState: { effects: [] },
    party: createParty(combatants.map(({ characterId }) => characterId)),
  });
};

// Pirouette's third step lands: Nilou's cast, the sword dance's third step and the field that follows it ticks
const landThirdStep = (context: KitContext): void => {
  NILOU_KIT.elementalSkill.onStart?.(context);
  const thirdStep = takeOne((findStance(context.kitEffectState)?.combatant.kit.normalAttacks ?? []).slice(2));
  thirdStep.onStart?.(context);
  findField(context.kitEffectState)?.onTick(context, 0);
};

// The hit the sword dance's third step holds in the stance on the team: Pirouette's copy of the illusion's hit, which
// Constellation 4 is set on, or Lunar Prayer's own once Lunar Prayer has taken the stance
const takeThirdStepHit = (kitEffectState: KitEffectState): KitHit =>
  takeOne(takeOne((findStance(kitEffectState)?.combatant.kit.normalAttacks ?? []).slice(2)).hits);

describe(createNilouKitBehaviour, () => {
  // The conversion bonuses a constellation count gives, each as its attribute and its amount rounded to a thousandth
  const getConversionBonusPairs = (constellationCount: number): [Attribute, number][] =>
    (NILOU_KIT.getConversionBonuses?.(createNilouCombatant(constellationCount), 1) ?? []).map(
      ({ amount, attribute }) => [attribute, Math.round(amount * 1000) / 1000],
    );

  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction, combatant = createNilouCombatant()): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    return kitEffectState;
  };

  const createNilouCombatant = (constellationCount = 0, ascension = 0, maxHealth = MAX_HEALTH): Combatant => ({
    ascension,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: maxHealth }]),
    characterId: NILOU_CHARACTER_ID,
    constellationCount,
    element: Element.Hydro,
    elementalResonances: [],
    kit: NILOU_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  });

  // A member of the team besides Nilou, of the element given, whose kit these tests never read, so Nilou's stands in
  const createMember = (characterId: number, element: Element): Combatant => ({
    ...createNilouCombatant(),
    characterId,
    element,
  });

  const MAX_HEALTH = 10_000;
  // Health past every energy threshold, so that no hit in these tests drops an enemy's energy
  const SURVIVING_HEALTH = 1e9;
  const kitBody = createKitBody({ x: 0, z: 0 });

  // Two enemies at the origin, which every area a hit reaches takes in
  const createTwoEnemyMap = (): Map<string, Enemy> => {
    const enemies = ["first", "second"].map((id) => createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, id }, ""));
    for (const enemy of enemies) enemy.health = SURVIVING_HEALTH;
    return new Map(enemies.map((enemy) => [enemy.id, enemy]));
  };

  // Nilou's skill enters Pirouette, and the combatant given strikes the two enemies with the copy of the illusion's hit
  // That the third step carries
  const strikeWithPirouetteThirdStep = (combatant: Combatant): KitContext => {
    const context = createKitTestContext(combatant, { enemyMap: createTwoEnemyMap(), enemyTables });
    NILOU_KIT.elementalSkill.onStart?.(context);
    strikeKitEnemies([{ body: context.body, combatant, hit: takeThirdStepHit(context.kitEffectState) }], context);
    return context;
  };

  test("reads the strikes', charged attack's, plunges' multipliers from her proud skill group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NILOU_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...NILOU_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      NILOU_KIT.plungeCollision.talentMultiplier,
      takeOne(NILOU_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NILOU_KIT.highPlunge.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([0.503074, 0.45439, 0.70354, 0.50224, 0.54438, 0.639324, 1.278377, 1.596762]);
  });

  test("the charged attack costs 20 stamina, her skill cools for 18 seconds, and her burst costs 70 energy and cools for 18", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: NILOU_KIT.burstCooldownSeconds,
      burstEnergyCost: NILOU_KIT.burstEnergyCost,
      chargedAttackStamina: NILOU_KIT.chargedAttackStamina,
      skillCooldownSeconds: NILOU_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 18,
      burstEnergyCost: 70,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 18,
    });
  });

  test("dance of Haftkarsvar's hit is priced at its share of Max HP, not ATK, at 16 frames", () => {
    expect.hasAssertions();
    const hit = takeOne(NILOU_KIT.elementalSkill.hits);

    expect({
      flatDamage: Math.round((hit.additiveBaseDamageBonus?.(createNilouCombatant()) ?? 0) * 100) / 100,
      hitmarkFrames: Math.round(hit.hitmarkSeconds * 60),
      multiplier: hit.talentMultiplier,
    }).toStrictEqual({ flatDamage: 333.89, hitmarkFrames: 16, multiplier: 0 });
  });

  test("dance of Abzendegi's hit is priced at its share of Max HP, at 91 frames", () => {
    expect.hasAssertions();
    const hit = takeOne(NILOU_KIT.elementalBurst.hits);

    expect({
      flatDamage: Math.round((hit.additiveBaseDamageBonus?.(createNilouCombatant()) ?? 0) * 100) / 100,
      hitmarkFrames: Math.round(hit.hitmarkSeconds * 60),
    }).toStrictEqual({ flatDamage: 1843.2, hitmarkFrames: 91 });
  });

  test("dance of Haftkarsvar leaves Pirouette on the team for ten seconds, with the sword dance as its normal attacks", () => {
    expect.hasAssertions();
    const stance = findStance(castAction(NILOU_KIT.elementalSkill));

    expect({
      normalAttacks: stance?.combatant.kit.normalAttacks.length,
      secondsRemaining: stance?.secondsRemaining,
      skillHitmarkFrames: Math.round(takeOne(stance?.combatant.kit.elementalSkill.hits ?? []).hitmarkSeconds * 60),
    }).toStrictEqual({ normalAttacks: 3, secondsRemaining: 10, skillHitmarkFrames: 21 });
  });

  test("the third sword dance sets Lunar Prayer on the team 30 frames on, for eight seconds", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant();
    const kitEffectState = castAction(NILOU_KIT.elementalSkill, combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    const thirdStep = takeOne((findStance(kitEffectState)?.combatant.kit.normalAttacks ?? []).slice(2));
    thirdStep.onStart?.(context);
    const endField = findField(kitEffectState);
    endField?.onTick(context, 0);

    expect({
      lunarPrayerNormalAttacks: findStance(kitEffectState)?.combatant.kit.normalAttacks.length,
      lunarPrayerSeconds: findStance(kitEffectState)?.secondsRemaining,
      nextTickFrames: Math.round((endField?.nextTickSeconds ?? 0) * 60),
    }).toStrictEqual({ lunarPrayerNormalAttacks: 3, lunarPrayerSeconds: 8, nextTickFrames: 30 });
  });

  test("constellation 1 raises Luminous Illusion's DMG by 65%, and no other strike's", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(1);
    const sword = findStance(castAction(NILOU_KIT.elementalSkill, combatant))?.combatant.kit.normalAttacks ?? [];
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const party = createParty([NILOU_CHARACTER_ID]);
    const getBonus = (action: KitAction, constellationCount: number): number | undefined =>
      NILOU_KIT.getStrikeDamageBonus?.(
        {
          attackTag: AttackTag.ElementalSkill,
          body: kitBody,
          combatant: createNilouCombatant(constellationCount),
          hit: takeOne(action.hits),
        },
        enemy,
        party,
        [],
      );
    const illusion = takeOne(sword.slice(2));

    expect({
      firstStrike: getBonus(takeOne(sword.slice(0, 1)), 1),
      illusion: getBonus(illusion, 1),
      illusionAtConstellation0: getBonus(illusion, 0),
    }).toStrictEqual({ firstStrike: 0, illusion: 0.65, illusionAtConstellation0: 0 });
  });

  test("constellation 6 gives CRIT Rate and CRIT DMG for each 1,000 Max HP, capped at 30% and 60%", () => {
    expect.hasAssertions();
    expect({ constellation5: getConversionBonusPairs(5), constellation6: getConversionBonusPairs(6) }).toStrictEqual({
      constellation5: [],
      constellation6: [
        [Attribute.CriticalRate, 0.06],
        [Attribute.CriticalDamage, 0.12],
      ],
    });
  });

  test("leaving the field cancels the field that would hand the team Lunar Prayer", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant();
    const kitEffectState = castAction(NILOU_KIT.elementalSkill, combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    takeOne((findStance(kitEffectState)?.combatant.kit.normalAttacks ?? []).slice(2)).onStart?.(context);
    NILOU_KIT.onKitEvent?.(
      { characterId: KUKI_CHARACTER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: NILOU_CHARACTER_ID },
      context,
      combatant,
    );

    expect(findField(kitEffectState)?.secondsRemaining).toBe(0);
  });

  test("the third dance step gives a Dendro and Hydro team the Bounty for 30 seconds, from Ascension 1", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(0, 1);
    const context = createTeamContext(combatant, [
      createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro),
      createMember(YELAN_CHARACTER_ID, Element.Hydro),
    ]);
    landThirdStep(context);

    expect(findStatuses(context.kitEffectState)).toStrictEqual(
      [NILOU_CHARACTER_ID, ALHAITHAM_CHARACTER_ID, YELAN_CHARACTER_ID].map((characterId) => ({
        characterId,
        id: GOLDEN_CHALICE_BOUNTY_STATUS_ID,
        kind: "status",
        secondsRemaining: 30,
      })),
    );
  });

  test.each<[string, number, Combatant[]]>([
    [
      "a Pyro member stands in the team",
      1,
      [createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro), createMember(DILUC_CHARACTER_ID, Element.Pyro)],
    ],
    ["no Dendro member stands in the team", 1, [createMember(YELAN_CHARACTER_ID, Element.Hydro)]],
    [
      "Nilou is below Ascension 1",
      0,
      [createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro), createMember(YELAN_CHARACTER_ID, Element.Hydro)],
    ],
  ])("gives no member the Golden Chalice's Bounty while %s", (_description, ascension, members) => {
    expect.hasAssertions();
    const context = createTeamContext(createNilouCombatant(0, ascension), members);
    landThirdStep(context);

    expect(findStatuses(context.kitEffectState)).toStrictEqual([]);
  });

  test("a Dendro hit on a member under the Bounty gives every member 100 Elemental Mastery for 10 seconds", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(0, 1);
    const context = createTeamContext(combatant, [
      createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro),
      createMember(YELAN_CHARACTER_ID, Element.Hydro),
    ]);
    landThirdStep(context);
    NILOU_KIT.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: ALHAITHAM_CHARACTER_ID,
        element: Element.Dendro,
        healthShare: -0.1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      combatant,
    );

    expect(findBuffs(context.kitEffectState)).toStrictEqual(
      [NILOU_CHARACTER_ID, ALHAITHAM_CHARACTER_ID, YELAN_CHARACTER_ID].map((characterId) => ({
        amount: 100,
        attribute: Attribute.ElementalMastery,
        characterId,
        kind: "buff",
        secondsRemaining: 10,
        source: GOLDEN_CHALICE_BOUNTY_STATUS_ID,
      })),
    );
  });

  test("a Hydro hit or a drain gives no Elemental Mastery under the Golden Chalice's Bounty", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(0, 1);
    const context = createTeamContext(combatant, [createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro)]);
    landThirdStep(context);
    const healthChanges: KitEvent[] = [
      {
        bondOfLifeShare: 0,
        characterId: ALHAITHAM_CHARACTER_ID,
        element: Element.Hydro,
        healthShare: -0.1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      {
        bondOfLifeShare: 0,
        characterId: ALHAITHAM_CHARACTER_ID,
        healthShare: -0.1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
    ];
    for (const healthChange of healthChanges) NILOU_KIT.onKitEvent?.(healthChange, context, combatant);

    expect(findBuffs(context.kitEffectState)).toStrictEqual([]);
  });

  test("a Dendro hit on a member without the Golden Chalice's Bounty gives no Elemental Mastery", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(0, 1);
    const context = createTeamContext(combatant, [createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro)]);
    NILOU_KIT.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: ALHAITHAM_CHARACTER_ID,
        element: Element.Dendro,
        healthShare: -0.1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      combatant,
    );

    expect(findBuffs(context.kitEffectState)).toStrictEqual([]);
  });

  const getBonus = (ascension: number, maxHealth: number, coreKind: DendroCoreKind): number => {
    const combatant = createNilouCombatant(0, ascension, maxHealth);
    const bonus =
      NILOU_KIT.getPartyReactionBonus?.(
        combatant,
        {
          combatant,
          coreKind,
          element: Element.Dendro,
          enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
          reactionType: ReactionType.Bloom,
        },
        createTeamContext(combatant, []),
      )?.damageBonus ?? 0;
    return Math.round(bonus * 1000) / 1000;
  };

  test("ascension 4 raises a Bountiful Core's DMG by 9% per 1,000 Max HP above 30,000, up to 400%", () => {
    expect.hasAssertions();

    expect({
      atAscension3: getBonus(3, 40_000, DendroCoreKind.Bountiful),
      atFortyThousand: getBonus(4, 40_000, DendroCoreKind.Bountiful),
      atThreshold: getBonus(4, 30_000, DendroCoreKind.Bountiful),
      bloomCore: getBonus(4, 40_000, DendroCoreKind.Bloom),
      capped: getBonus(4, 100_000, DendroCoreKind.Bountiful),
    }).toStrictEqual({ atAscension3: 0, atFortyThousand: 0.9, atThreshold: 0, bloomCore: 0, capped: 4 });
  });

  test("constellation 2 lowers an enemy's Hydro RES by 35% for ten seconds as a member under the Bounty deals Hydro DMG", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(2, 1);
    const context = createTeamContext(combatant, [createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro)]);
    landThirdStep(context);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    NILOU_KIT.onKitEvent?.(
      {
        element: Element.Hydro,
        enemy,
        kind: KitEventKind.EnemyHit,
        striker: createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro),
      },
      context,
      combatant,
    );

    expect(enemy.statuses).toStrictEqual([
      {
        damageTakenBonus: 0,
        id: "nilou-c2-hydro",
        resistanceReduction: { [Element.Hydro]: 0.35 },
        secondsRemaining: 10,
      },
    ]);
  });

  test("constellation 2 lowers an enemy's Dendro RES by 35% for ten seconds as a Bloom or Lunar-Bloom reaction triggers on it", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(2, 1);
    const context = createTeamContext(combatant, [createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro)]);
    const bloomEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const lunarBloomEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const reactionTriggered = (enemy: typeof bloomEnemy, reactionType: ReactionType): KitEvent => ({
      enemy,
      kind: KitEventKind.ReactionTriggered,
      reactions: [{ reactionType }],
      striker: createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro),
    });
    NILOU_KIT.onKitEvent?.(reactionTriggered(bloomEnemy, ReactionType.Bloom), context, combatant);
    NILOU_KIT.onKitEvent?.(reactionTriggered(lunarBloomEnemy, ReactionType.LunarBloom), context, combatant);

    const dendroStatus = {
      damageTakenBonus: 0,
      id: "nilou-c2-dendro",
      resistanceReduction: { [Element.Dendro]: 0.35 },
      secondsRemaining: 10,
    };
    expect([bloomEnemy.statuses, lunarBloomEnemy.statuses]).toStrictEqual([[dendroStatus], [dendroStatus]]);
  });

  test("constellation 1 cuts no enemy's RES, from a Hydro hit under the Bounty or a Bloom reaction", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(1, 1);
    const context = createTeamContext(combatant, [createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro)]);
    landThirdStep(context);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    NILOU_KIT.onKitEvent?.(
      {
        element: Element.Hydro,
        enemy,
        kind: KitEventKind.EnemyHit,
        striker: createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro),
      },
      context,
      combatant,
    );
    NILOU_KIT.onKitEvent?.(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ reactionType: ReactionType.Bloom }],
        striker: createMember(ALHAITHAM_CHARACTER_ID, Element.Dendro),
      },
      context,
      combatant,
    );

    expect(enemy.statuses).toStrictEqual([]);
  });

  test("constellation 4 gives 15 Elemental Energy once per attack, on the first enemy the Pirouette third step strikes", () => {
    expect.hasAssertions();
    const context = strikeWithPirouetteThirdStep(createNilouCombatant(4));
    const constellation3Context = strikeWithPirouetteThirdStep(createNilouCombatant(3));

    expect({
      burstStatuses: findStatuses(context.kitEffectState),
      burstStatusesAtConstellation3: findStatuses(constellation3Context.kitEffectState),
      energy: getPartyMember(context.party, NILOU_CHARACTER_ID).energy,
      energyAtConstellation3: getPartyMember(constellation3Context.party, NILOU_CHARACTER_ID).energy,
    }).toStrictEqual({
      burstStatuses: [{ characterId: NILOU_CHARACTER_ID, id: "nilou-c4-burst", kind: "status", secondsRemaining: 8 }],
      burstStatusesAtConstellation3: [],
      energy: 15,
      energyAtConstellation3: 0,
    });
  });

  test("lunar Prayer's third step gives no Constellation 4 energy", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(4);
    const context = createKitTestContext(combatant, { enemyMap: createTwoEnemyMap(), enemyTables });
    landThirdStep(context);
    strikeKitEnemies([{ body: context.body, combatant, hit: takeThirdStepHit(context.kitEffectState) }], context);

    expect({
      burstStatuses: findStatuses(context.kitEffectState),
      energy: getPartyMember(context.party, NILOU_CHARACTER_ID).energy,
    }).toStrictEqual({ burstStatuses: [], energy: 0 });
  });
});
