import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createFischlKitBehaviour, FISCHL_CHARACTER_ID } from "#src/services/kit/characters/fischlKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const FISCHL_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, FISCHL_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createFischlCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: FISCHL_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: FISCHL_KIT,
  level: 90,
});

// The multipliers of the hits the summons on the team other than Oz land
const castHits = (kitEffectState: KitEffectState): number[] =>
  kitEffectState.effects.flatMap((effect) =>
    effect.kind === "summon" && effect.id === undefined ? effect.hits.map((hit) => hit.talentMultiplier) : [],
  );

// The summons an action's start casts, as the kit's effects hold them
const castSummons = (action: KitAction, combatant = createFischlCombatant()): KitSummon[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  return kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon");
};

// The team's effects with the skill's Oz standing, spawned
const castStandingOz = (combatant: Combatant): KitEffectState => {
  const kitEffectState: KitEffectState = { effects: [] };
  FISCHL_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  for (const effect of kitEffectState.effects) if (effect.kind === "summon") effect.elapsedSeconds = 1;
  return kitEffectState;
};

// One Overloaded reaction by the active character, with Oz standing, as Fischl at the ascension stood
const triggerOverloaded = (ascension: number): KitEffectState => {
  const combatant = createFischlCombatant(ascension);
  const kitEffectState = castStandingOz(combatant);
  FISCHL_KIT.onKitEvent?.(
    {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      kind: KitEventKind.ReactionTriggered,
      reactions: [{ reactionType: ReactionType.Overloaded }],
      striker: combatant,
    },
    createKitTestContext(combatant, { kitEffectState }),
    combatant,
  );
  return kitEffectState;
};

describe(createFischlKitBehaviour, () => {
  const travelerCombatant: Combatant = {
    ...createFischlCombatant(),
    characterId: TRAVELER_CHARACTER_ID,
    kit: TRAVELER_KIT,
  };

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const [oz] = castSummons(FISCHL_KIT.elementalSkill);
    const multipliers = [
      ...FISCHL_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(FISCHL_KIT.chargedAttack.hits).talentMultiplier,
      FISCHL_KIT.plungeCollision.talentMultiplier,
      takeOne(FISCHL_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(FISCHL_KIT.highPlunge.hits).talentMultiplier,
      takeOne(oz?.hits ?? []).talentMultiplier,
      takeOne(oz?.hits.slice(1) ?? []).talentMultiplier,
      takeOne(FISCHL_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.4412, 0.4678, 0.5814, 0.5771, 0.7207, 1.24, 0.5683, 1.1363, 1.4193, 1.1544, 0.888, 2.08,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("the skill's Oz strikes at 38 frames on the press and attacks 10 times, the first at 92 frames", () => {
    expect.hasAssertions();
    const [oz] = castSummons(FISCHL_KIT.elementalSkill);
    const [summonHit, ...attackHits] = oz?.hits ?? [];

    expect(oz?.spawnSeconds).toBeCloseTo(18 / 60);
    expect(summonHit?.hitmarkSeconds).toBeCloseTo(38 / 60);
    expect(attackHits).toHaveLength(10);
    expect(attackHits[0]?.hitmarkSeconds).toBeCloseTo(92 / 60);
    expect(attackHits.at(-1)?.hitmarkSeconds).toBeCloseTo((92 + 9 * 59) / 60);
  });

  test("the burst's Oz attacks nine times from 192 frames, 59 frames apart", () => {
    expect.hasAssertions();
    const [oz] = castSummons(FISCHL_KIT.elementalBurst);

    expect(oz?.hits).toHaveLength(9);
    expect(oz?.hits[0]?.hitmarkSeconds).toBeCloseTo(192 / 60);
    expect(oz?.hits.at(-1)?.hitmarkSeconds).toBeCloseTo((192 + 8 * 59) / 60);
  });

  test("one Oz stands at a time, the burst's ending the skill's", () => {
    expect.hasAssertions();
    const combatant = createFischlCombatant();
    const kitEffectState = castStandingOz(combatant);
    const [skillOz] = kitEffectState.effects;
    FISCHL_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));

    expect(skillOz?.secondsRemaining).toBe(0);
    expect(kitEffectState.effects).toHaveLength(2);
  });

  test("two constellations raise the summon's damage by 200% over a radius of 3, and six keep Oz 2 seconds longer", () => {
    expect.hasAssertions();
    const [devourerOz] = castSummons(FISCHL_KIT.elementalSkill, createFischlCombatant(0, 2));
    const [evernightOz] = castSummons(FISCHL_KIT.elementalSkill, createFischlCombatant(0, 6));

    expect(devourerOz?.hits[0]?.talentMultiplier).toBeCloseTo(3.1544);
    expect(devourerOz?.hits[0]?.hitArea.radius).toBe(FISCHL_KIT.elementalSkill.targetingArea.radius + 3);
    expect(evernightOz?.hits.slice(1)).toHaveLength(12);
  });

  test("ascension 4 strikes Thundering Retribution on an Electro reaction while Oz stands, once in half a second", () => {
    expect.hasAssertions();
    const combatant = createFischlCombatant(4);
    const kitEffectState = castStandingOz(combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const triggerReaction = (reactionType: ReactionType): void =>
      FISCHL_KIT.onKitEvent?.(
        { enemy, kind: KitEventKind.ReactionTriggered, reactions: [{ reactionType }], striker: combatant },
        context,
        combatant,
      );
    triggerReaction(ReactionType.Melt);

    expect(castHits(kitEffectState)).toStrictEqual([]);

    triggerReaction(ReactionType.Overloaded);
    triggerReaction(ReactionType.Overloaded);

    expect(castHits(kitEffectState)).toStrictEqual([0.8]);
    expect(
      kitEffectState.effects.flatMap((effect) =>
        effect.kind === "summon" && effect.id === undefined ? [effect.attackTag] : [],
      ),
    ).toStrictEqual([AttackTag.ElementalSkill]);
  });

  test("the Ascension 4 passive, Undone Be Thy Sinful Hex, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castHits(triggerOverloaded(4))).toStrictEqual([0.8]);
  });

  test("the Ascension 4 passive, Undone Be Thy Sinful Hex, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castHits(triggerOverloaded(3))).toStrictEqual([]);
  });

  test("one constellation's coordinated attack follows her normal attack while Oz is away", () => {
    expect.hasAssertions();
    const combatant = createFischlCombatant(0, 1);
    const context = createKitTestContext(combatant);
    const standingOzContext = createKitTestContext(combatant, { kitEffectState: castStandingOz(combatant) });
    const event = { action: takeOne(FISCHL_KIT.normalAttacks), kind: KitEventKind.NormalAttackLanded } as const;
    FISCHL_KIT.onKitEvent?.(event, context, combatant);
    FISCHL_KIT.onKitEvent?.(event, standingOzContext, combatant);

    expect(castHits(context.kitEffectState)).toStrictEqual([0.22]);
    expect(castHits(standingOzContext.kitEffectState)).toStrictEqual([]);
  });

  test("six constellations make Oz attack along with the normal attacks of the character on the field", () => {
    expect.hasAssertions();
    const combatant = createFischlCombatant(0, 6);
    const kitEffectState = castStandingOz(combatant);
    FISCHL_KIT.onKitEvent?.(
      { action: takeOne(TRAVELER_KIT.normalAttacks), kind: KitEventKind.NormalAttackLanded },
      createKitTestContext(combatant, { activeCombatant: travelerCombatant, kitEffectState }),
      combatant,
    );

    expect(castHits(kitEffectState)).toStrictEqual([0.3]);
  });

  test("a swap during the burst spawns its Oz at once", () => {
    expect.hasAssertions();
    const combatant = createFischlCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    FISCHL_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    FISCHL_KIT.onKitEvent?.(
      {
        characterId: TRAVELER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: FISCHL_CHARACTER_ID,
      },
      createKitTestContext(combatant, { activeCombatant: travelerCombatant, kitEffectState }),
      combatant,
    );
    const [burstOz, swapOz] = kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon");

    expect(burstOz?.secondsRemaining).toBe(0);
    expect(swapOz?.spawnSeconds).toBeCloseTo(1 / 60);
    expect(swapOz?.hits[0]?.hitmarkSeconds).toBeCloseTo((1 + 63 + 10) / 60);
  });

  test("four constellations add the burst's extra hit and heal her by 20% of her Max HP a frame after Oz spawns", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createFischlCombatant(0, 4));
    getPartyMember(context.party, FISCHL_CHARACTER_ID).healthShare = 0.5;
    FISCHL_KIT.elementalBurst.onStart?.(context);
    const strikes = stepKitTestEffects(114 / 60, context);

    expect(strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([2.22]);
    expect(getPartyMember(context.party, FISCHL_CHARACTER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("the skill's cooldown, the burst's cooldown and energy cost come from the dump's groups", () => {
    expect.hasAssertions();

    expect(FISCHL_KIT.skillCooldownSeconds).toBe(25);
    expect(FISCHL_KIT.burstCooldownSeconds).toBe(15);
    expect(FISCHL_KIT.burstEnergyCost).toBe(60);
  });
});
