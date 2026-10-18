import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createJahodaKitBehaviour, JAHODA_CHARACTER_ID } from "#src/services/kit/characters/jahodaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const JAHODA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, JAHODA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// A made-up character who holds a Moonsign Benediction, so the team reads as Ascendant Gleam with Jahoda's own
const MOONSIGN_PARTNER_CHARACTER_ID = 1;
const MOONSIGN_BENEDICTION = { lunarReactionTypes: [LunarReactionType.LunarCharged] };
const createJahodaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: JAHODA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: JAHODA_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

// Constellation 6's buff sources, made up, as the buff a source names restarts only itself
const CONSTELLATION_6_SOURCE = "jahoda-constellation-6";

// A team of Jahoda and a partner. Jahoda's kit holds a Moonsign Benediction, as a Moonsign character's kit does.
// Its partner's does too when the team is to be at Ascendant Gleam. One enemy holding an aura stands at the origin.
// Jahoda's pursuit is returned, so a test can run its ticks until the flask drains
const createConstellation6Context = (constellationCount: number, isPartnerMoonsign: boolean) => {
  const combatant: Combatant = {
    ...createJahodaCombatant(),
    constellationCount,
    kit: { ...JAHODA_KIT, moonsignBenediction: MOONSIGN_BENEDICTION },
  };
  const partner: Combatant = {
    ...createJahodaCombatant(),
    characterId: MOONSIGN_PARTNER_CHARACTER_ID,
    kit: isPartnerMoonsign ? { ...JAHODA_KIT, moonsignBenediction: MOONSIGN_BENEDICTION } : JAHODA_KIT,
  };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  applyElement(enemy.elementalState, Element.Pyro, 1);
  const context = createKitTestContext(combatant, {
    characterIdCombatantMap: new Map([
      [combatant.characterId, combatant],
      [partner.characterId, partner],
    ]),
    enemyMap: new Map([[enemy.id, enemy]]),
    party: createParty([combatant.characterId, partner.characterId]),
  });
  JAHODA_KIT.elementalSkill.onStart?.(context);
  const [pursuit] = context.kitEffectState.effects;
  if (pursuit?.kind !== "field") throw new Error("The press casts no pursuit");
  return { context, partner, pursuit };
};

// Runs the pursuit's ticks until the flask drains, which casts its drain's summon, within a bounded number of ticks
const fillFlaskUntilDrained = (
  pursuit: { onTick: (context: ReturnType<typeof createKitTestContext>, tickIndex: number) => void },
  context: ReturnType<typeof createKitTestContext>,
): void => {
  for (let tickIndex = 0; tickIndex < 100; tickIndex++) {
    pursuit.onTick(context, tickIndex);
    if (context.kitEffectState.effects.some(({ kind }) => kind === "summon")) return;
  }
  throw new Error("The flask never drains");
};

describe(createJahodaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...JAHODA_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(JAHODA_KIT.chargedAttack.hits).talentMultiplier,
      JAHODA_KIT.plungeCollision.talentMultiplier,
      takeOne(JAHODA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(JAHODA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(JAHODA_KIT.elementalBurst.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.416739, 0.192313, 0.192313, 0.511975, 1.24, 0.568288, 1.136335, 1.419344, 2.072,
    ]);
  });

  test("each strike lands 10 frames after its hitmark, and each action cancels at its walk frame", () => {
    expect.hasAssertions();
    expect(
      JAHODA_KIT.normalAttacks.map((action) => ({
        cancelFrames: Math.round(action.seconds * 60),
        hitFrames: action.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      })),
    ).toStrictEqual([
      { cancelFrames: 35, hitFrames: [24] },
      { cancelFrames: 52, hitFrames: [25, 39] },
      { cancelFrames: 99, hitFrames: [50] },
    ]);
  });

  test("the press starts the pursuit with no hit, and its second press drains an unfilled flask at 4 frames", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createJahodaCombatant(), { kitEffectState });
    JAHODA_KIT.elementalSkill.onStart?.(context);
    expect(kitEffectState.effects.map(({ kind }) => kind)).toStrictEqual(["field", "status", "field"]);
    const drain = takeOne(JAHODA_KIT.elementalSkillChain?.followUps ?? []);
    drain.onStart?.(context);
    expect(kitEffectState.effects).toHaveLength(1);
    const [summon] = kitEffectState.effects;
    expect(summon?.kind === "summon" && takeOne(summon.hits)).toStrictEqual({
      element: Element.Anemo,
      gauge: 1,
      hitArea: { angle: 2 * Math.PI, height: 5, radius: 5 },
      hitmarkSeconds: 4 / 60,
      poiseDamage: 0,
      talentMultiplier: 1.908,
    });
  });

  test("constellation 6 buffs each Moonsign member's Crit Rate and Crit DMG for 20 seconds when a full flask drains at Ascendant Gleam", () => {
    expect.hasAssertions();
    const { context, partner, pursuit } = createConstellation6Context(6, true);
    fillFlaskUntilDrained(pursuit, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual(
      [JAHODA_CHARACTER_ID, partner.characterId].flatMap((characterId) => [
        {
          amount: 0.05,
          attribute: Attribute.CriticalRate,
          characterId,
          kind: "buff",
          secondsRemaining: 20,
          source: CONSTELLATION_6_SOURCE,
        },
        {
          amount: 0.4,
          attribute: Attribute.CriticalDamage,
          characterId,
          kind: "buff",
          secondsRemaining: 20,
          source: CONSTELLATION_6_SOURCE,
        },
      ]),
    );
  });

  test("constellation 6 buffs nothing when the team is only Nascent Gleam", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(6, false);
    fillFlaskUntilDrained(pursuit, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });

  test("constellation 5 buffs nothing when the team is at Ascendant Gleam", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(5, true);
    fillFlaskUntilDrained(pursuit, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });
});
