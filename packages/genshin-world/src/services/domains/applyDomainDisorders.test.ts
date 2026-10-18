import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import {
  applyDomainDisorder,
  clearDomainDisorders,
  getDomainDisorderSource,
  triggerDomainDisorder,
} from "#src/services/domains/applyDomainDisorders";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;
const SECONDS = 300;
const FIRE = "LevelEntity_ElementAddHurt_Fire";
const WATER = "LevelBuff_LoopDungeon_ElementAddHurt_Water";
const HP = "LevelBuff_LoopDungeon_HpUpOrDown_CriticalHurtUp";
const SWIRL = "LevelEntity_LoopDungeon_MasteryUp_WindDamageUp_V3.3";
const VAPORIZE = { kind: "reaction" as const, reactions: [{ reactionType: ReactionType.Vaporize }] };

describe(applyDomainDisorder, () => {
  test("a ley line disorder changes the fight", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    applyDomainDisorder(kitEffectState, createParty([CHARACTER_ID]), FIRE, SECONDS);
    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.75,
        attribute: Attribute.PyroDamageBonus,
        characterId: CHARACTER_ID,
        kind: "buff",
        secondsRemaining: SECONDS,
        source: getDomainDisorderSource(FIRE, 0),
      },
    ]);
  });

  test("a disorder the fight does not model changes nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    applyDomainDisorder(
      kitEffectState,
      createParty([CHARACTER_ID]),
      "LevelBuff_LoopDungeon_ShockReactionTriggerImpact",
      SECONDS,
    );
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("clearing ends the disorders' bonuses and keeps every other buff", () => {
    expect.hasAssertions();

    const other = {
      amount: 0.2,
      attribute: Attribute.PyroDamageBonus,
      characterId: CHARACTER_ID,
      kind: "buff" as const,
      secondsRemaining: SECONDS,
      source: "other",
    };
    const kitEffectState: KitEffectState = { effects: [other] };
    applyDomainDisorder(kitEffectState, createParty([CHARACTER_ID]), FIRE, SECONDS);
    clearDomainDisorders(kitEffectState);
    expect(kitEffectState.effects).toStrictEqual([other]);
  });
});

describe(triggerDomainDisorder, () => {
  test("a reaction disorder changes the fight", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const readySeconds = triggerDomainDisorder(kitEffectState, createParty([CHARACTER_ID]), WATER, VAPORIZE, 0, 0);
    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.1,
        attribute: Attribute.HydroDamageBonus,
        characterId: CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: getDomainDisorderSource(WATER, 0),
      },
    ]);
    expect(readySeconds).toBe(2);
  });

  test("a reaction disorder ignores a reaction it does not name", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const melt = { kind: "reaction" as const, reactions: [{ element: Element.Pyro, reactionType: ReactionType.Melt }] };
    const readySeconds = triggerDomainDisorder(kitEffectState, createParty([CHARACTER_ID]), WATER, melt, 0, 0);
    expect(kitEffectState.effects).toStrictEqual([]);
    expect(readySeconds).toBe(0);
  });

  test("a reaction disorder waits out its cooldown", () => {
    expect.hasAssertions();

    const party = createParty([CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const readySeconds = triggerDomainDisorder(kitEffectState, party, WATER, VAPORIZE, 0, 0);
    expect(triggerDomainDisorder(kitEffectState, party, WATER, VAPORIZE, 1, readySeconds)).toBe(2);
    expect(kitEffectState.effects).toHaveLength(1);
  });

  test("a health change disorder stops at its stack limit", () => {
    expect.hasAssertions();

    const stacks = Array.from({ length: 10 }, (_, stack) => ({
      amount: 0.07,
      attribute: Attribute.CriticalDamage,
      characterId: CHARACTER_ID,
      kind: "buff" as const,
      secondsRemaining: 10,
      source: getDomainDisorderSource(HP, stack),
    }));
    const kitEffectState: KitEffectState = { effects: stacks };
    const readySeconds = triggerDomainDisorder(
      kitEffectState,
      createParty([CHARACTER_ID]),
      HP,
      { healthShare: -0.1, kind: "healthChange" },
      5,
      0,
    );
    expect(kitEffectState.effects).toStrictEqual(stacks);
    expect(readySeconds).toBe(0);
  });

  test("a disorder without stacks restarts its bonus instead of stacking it", () => {
    expect.hasAssertions();

    const party = createParty([CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    triggerDomainDisorder(
      kitEffectState,
      party,
      SWIRL,
      { kind: "reaction", reactions: [{ reactionType: ReactionType.Swirl }] },
      0,
      0,
    );
    triggerDomainDisorder(
      kitEffectState,
      party,
      SWIRL,
      { kind: "reaction", reactions: [{ reactionType: ReactionType.Swirl }] },
      0,
      0,
    );
    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.5,
        attribute: Attribute.AnemoDamageBonus,
        characterId: CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: getDomainDisorderSource(SWIRL, 0),
      },
    ]);
  });
});
