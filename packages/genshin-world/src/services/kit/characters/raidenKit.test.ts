import type { Combatant } from "#src/models/kit/Combatant";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEnergyParticleCollectedEvent } from "#src/models/kit/KitEnergyParticleCollectedEvent";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { FISCHL_CHARACTER_ID } from "#src/services/kit/characters/fischlKit";
import { createRaidenKit, RAIDEN_CHARACTER_ID } from "#src/services/kit/characters/raidenKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const RAIDEN_KIT = createRaidenKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [RAIDEN_CHARACTER_ID]));

const createRaidenCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: RAIDEN_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: RAIDEN_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

// The Resolve stacks she holds among the team's effects
const readResolveStacks = ({ effects }: KitEffectState): number | undefined =>
  effects.find((effect): effect is KitStatus => effect.kind === "status" && effect.id === "raiden-resolve")?.stacks;

// The team's effects once the burst is cast with the Resolve stacks given, and the Musou Isshin stance it takes
const castBurst = (stacks: number): { kitEffectState: KitEffectState; stance?: KitStance } => {
  const kitEffectState: KitEffectState = {
    effects: [{ characterId: RAIDEN_CHARACTER_ID, id: "raiden-resolve", kind: "status", secondsRemaining: 1, stacks }],
  };
  RAIDEN_KIT.elementalBurst.onStart?.(createKitTestContext(createRaidenCombatant(), { kitEffectState }));
  return {
    kitEffectState,
    stance: kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance"),
  };
};

describe(createRaidenKit, () => {
  test("the burst spends resolve's stacks into musou no hitotachi and each musou isshin strike", () => {
    expect.hasAssertions();
    const { kitEffectState, stance } = castBurst(1);
    const summon = kitEffectState.effects.find((effect) => effect.kind === "summon");
    if (summon?.kind !== "summon") throw new Error("the burst casts no Musou no Hitotachi");

    expect(summon.hits[0]?.talentMultiplier).toBeCloseTo(4.008 + 0.03888);
    expect(stance?.actions.normalAttacks[0]?.hits[0]?.talentMultiplier).toBeCloseTo(0.447374 + 0.007262);
    expect(kitEffectState.effects.some((effect) => effect.kind === "status")).toBe(false);
  });

  test("another member's burst gives her resolve by its energy cost, constellation 1 raising an electro member's", () => {
    expect.hasAssertions();
    const electroMember: Combatant = {
      ...createRaidenCombatant(),
      characterId: FISCHL_CHARACTER_ID,
      element: Element.Electro,
    };
    const createContext = (constellationCount: number) =>
      createKitTestContext(
        { ...createRaidenCombatant(), constellationCount },
        {
          characterIdCombatantMap: new Map([[FISCHL_CHARACTER_ID, electroMember]]),
          party: createParty([RAIDEN_CHARACTER_ID, FISCHL_CHARACTER_ID]),
        },
      );
    const context = createContext(0);
    const constellationContext = createContext(1);
    for (const eventContext of [context, constellationContext]) {
      RAIDEN_KIT.onKitEvent?.(
        { characterId: RAIDEN_CHARACTER_ID, energyCost: 90, kind: KitEventKind.BurstUsed },
        eventContext,
        eventContext.activeCombatant,
      );
      RAIDEN_KIT.onKitEvent?.(
        { characterId: FISCHL_CHARACTER_ID, energyCost: 60, kind: KitEventKind.BurstUsed },
        eventContext,
        eventContext.activeCombatant,
      );
    }

    expect(readResolveStacks(context.kitEffectState)).toBeCloseTo(0.15 * 60);
    expect(readResolveStacks(constellationContext.kitEffectState)).toBeCloseTo(0.15 * 60 * 1.8);
  });

  test("from ascension 1 the party's particles give her 2 resolve stacks once every 3 seconds", () => {
    expect.hasAssertions();
    const combatant = { ...createRaidenCombatant(), ascension: 1 };
    const context = createKitTestContext(combatant);
    const event: KitEnergyParticleCollectedEvent = {
      characterId: RAIDEN_CHARACTER_ID,
      count: 1,
      energyDropKind: EnergyDropKind.Particle,
      kind: KitEventKind.EnergyParticleCollected,
    };

    RAIDEN_KIT.onKitEvent?.(event, context, combatant);
    RAIDEN_KIT.onKitEvent?.(event, context, combatant);

    expect(readResolveStacks(context.kitEffectState)).toBe(2);
  });

  test("musou isshin's strikes restore the team's energy once a second", () => {
    expect.hasAssertions();
    const { kitEffectState, stance } = castBurst(0);
    const combatant = createRaidenCombatant();
    const context = createKitTestContext(combatant, { kitEffectState });
    const event: KitDamageTakenEvent = {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      hit: takeOne(takeOne(stance?.actions.normalAttacks ?? []).hits),
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker: createRaidenCombatant(),
    };

    RAIDEN_KIT.onKitEvent?.(event, context, combatant);
    RAIDEN_KIT.onKitEvent?.(event, context, combatant);

    expect(getPartyMember(context.party, RAIDEN_CHARACTER_ID).energy).toBeCloseTo(1.6);
  });

  test("a member holding the eye sets off one coordinated attack in 0.9 seconds", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = {
      effects: [{ characterId: RAIDEN_CHARACTER_ID, id: "raiden-eye", kind: "status", secondsRemaining: 1 }],
    };
    const combatant = createRaidenCombatant();
    const context = createKitTestContext(combatant, { kitEffectState });
    const event: KitDamageTakenEvent = {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      hit: takeOne(takeOne(RAIDEN_KIT.normalAttacks).hits),
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker: createRaidenCombatant(),
    };

    RAIDEN_KIT.onKitEvent?.(event, context, combatant);
    RAIDEN_KIT.onKitEvent?.(event, context, combatant);

    expect(kitEffectState.effects.filter((effect) => effect.kind === "summon")).toHaveLength(1);
  });
});
