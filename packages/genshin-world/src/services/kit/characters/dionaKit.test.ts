import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createDionaKitBehaviour, DIONA_CHARACTER_ID } from "#src/services/kit/characters/dionaKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const DIONA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DIONA_CHARACTER_ID);
const createDionaCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: DIONA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: DIONA_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

// The shield an action's start sets on the team
const castShield = (action: KitAction, combatant = createDionaCombatant()): KitShield => {
  const context = createKitTestContext(combatant);
  action.onStart?.(context);
  const shield = context.kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
  if (!shield) throw new Error("Icy Paws sets no shield");
  return shield;
};

// The status each of Signature Mix's hits, its initial hit and its ticks, gives an enemy it strikes, struck by Diona at the
// Ascension
const readSignatureMixEnemyStatuses = (ascension: number) => {
  const combatant: Combatant = { ...createDionaCombatant(), ascension };
  const context = createKitTestContext(combatant);
  DIONA_KIT.elementalBurst.onStart?.(context);
  const ticks = takeOne(
    context.kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"),
  ).hits;
  return [takeOne(DIONA_KIT.elementalBurst.hits), ...ticks].map((hit) =>
    hit.enemyStatus?.(combatant, combatant.attributes.maxHealth),
  );
};

describe(createDionaKitBehaviour, () => {
  const holdAction = DIONA_KIT.elementalSkillHolds?.[0]?.action;

  test("the hold's shield is the tap's shield times the hold's bonus", () => {
    expect.hasAssertions();
    if (!holdAction) throw new Error("Icy Paws has no hold");

    const tapShield = castShield(DIONA_KIT.elementalSkill);
    const holdShield = castShield(holdAction);

    expect(holdShield.health / tapShield.health).toBeCloseTo(1.8);
  });

  test("constellation 2 raises the shield by 15%", () => {
    expect.hasAssertions();
    const tapShield = castShield(DIONA_KIT.elementalSkill, createDionaCombatant(0));
    const constellationShield = castShield(DIONA_KIT.elementalSkill, createDionaCombatant(2));

    expect(constellationShield.health / tapShield.health).toBeCloseTo(1.15);
  });
});

describe("drunkards' Farce", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const statuses = readSignatureMixEnemyStatuses(4);

    expect(statuses.length).toBeGreaterThan(1);
    expect(statuses).toStrictEqual(
      statuses.map(() => ({
        attackReduction: 0.1,
        damageTakenBonus: 0,
        id: "diona-drunkards-farce",
        secondsRemaining: 15,
      })),
    );
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readSignatureMixEnemyStatuses(3).every((status) => status === undefined)).toBe(true);
  });
});

// The buffs on a character, each as its attribute and amount
const readBuffs = (effects: KitEffectState["effects"], characterId: number) =>
  effects
    .filter((effect): effect is KitBuff => effect.kind === "buff" && effect.characterId === characterId)
    .map(({ amount, attribute }) => ({ amount, attribute }));

describe("cat's Tail Closing Time", () => {
  const ABOVE_HALF_CHARACTER_ID = 1;
  const AT_HALF_CHARACTER_ID = 2;
  // Diona casts Signature Mix at the constellation on a team of herself and two members, one above half its HP and one
  // At it, then the cast is stepped to a quarter second past its first tick, inside the half-second that tick's buffs last
  const readTickEffects = (constellationCount: number) => {
    const combatant = createDionaCombatant(constellationCount);
    const party = createParty([DIONA_CHARACTER_ID, ABOVE_HALF_CHARACTER_ID, AT_HALF_CHARACTER_ID]);
    getPartyMember(party, AT_HALF_CHARACTER_ID).healthShare = 0.5;
    const context = createKitTestContext(combatant, { party });
    DIONA_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, takeOne(DIONA_KIT.elementalBurst.hits).hitmarkSeconds + 0.25);
    return context.kitEffectState.effects;
  };

  test("each member gains Elemental Mastery above half its HP and Incoming Healing Bonus at or below it", () => {
    expect.hasAssertions();
    const effects = readTickEffects(6);

    expect(readBuffs(effects, DIONA_CHARACTER_ID)).toStrictEqual([
      { amount: 200, attribute: Attribute.ElementalMastery },
    ]);
    expect(readBuffs(effects, ABOVE_HALF_CHARACTER_ID)).toStrictEqual([
      { amount: 200, attribute: Attribute.ElementalMastery },
    ]);
    expect(readBuffs(effects, AT_HALF_CHARACTER_ID)).toStrictEqual([
      { amount: 0.3, attribute: Attribute.IncomingHealingBonus },
    ]);
  });

  test("a team below constellation 6 gains no buff", () => {
    expect.hasAssertions();
    const effects = readTickEffects(5);

    expect(
      [DIONA_CHARACTER_ID, ABOVE_HALF_CHARACTER_ID, AT_HALF_CHARACTER_ID].map((characterId) =>
        readBuffs(effects, characterId),
      ),
    ).toStrictEqual([[], [], []]);
  });
});
