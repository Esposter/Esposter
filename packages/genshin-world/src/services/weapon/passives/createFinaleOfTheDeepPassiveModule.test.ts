import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createFinaleOfTheDeepPassiveModule } from "#src/services/weapon/passives/createFinaleOfTheDeepPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const getBuffs = (effects: readonly KitEffect[], source: string) =>
  effects.filter((effect): effect is KitBuff => effect.kind === "buff" && effect.source === source);
const clearHealth = (bondOfLifeShare: number) => ({
  bondOfLifeShare,
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: 0,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged as const,
  overflowHealthShare: 0,
});

describe(createFinaleOfTheDeepPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.BaseHealth, value: 10000 }]);
  // Finale of the Deep with synthetic params: 10% ATK for twelve seconds after an Elemental Skill, and a Bond of Life
  // Worth a fifth of Max HP once every six seconds, and 3% of the HP a Bond of Life cleared as flat ATK, at most 90,
  // For eight seconds after it is cleared
  const finaleOfTheDeepPassiveModule = createFinaleOfTheDeepPassiveModule([0.1, 12, 0.2, 0.03, 90, 8, 6]);
  const skillUsed = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const };

  test("an Elemental Skill raises the wielder's ATK by the rank's percentage for the rank's seconds, and grants a Bond of Life worth the rank's share of its Max HP", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    finaleOfTheDeepPassiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(getBuffs(context.kitEffectState.effects, "finaleOfTheDeep")).toStrictEqual([
      {
        amount: 0.1,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "finaleOfTheDeep",
      },
    ]);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).bondOfLifeShare).toBe(0.2);
  });

  test("a second Elemental Skill inside the rank's cooldown grants nothing, and one after it grants again", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    finaleOfTheDeepPassiveModule.onKitEvent?.(skillUsed, context, wielder);
    finaleOfTheDeepPassiveModule.onKitEvent?.(skillUsed, context, wielder);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).bondOfLifeShare).toBe(0.2);

    stepKitSeconds(context, 6.5);
    finaleOfTheDeepPassiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).bondOfLifeShare).toBe(0.4);
  });

  test("a Bond of Life cleared raises the wielder's flat ATK by 3% of the HP it cleared, for eight seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeClearedShare = 0.25;
    finaleOfTheDeepPassiveModule.onKitEvent?.(clearHealth(0.25), context, wielder);

    const buffs = getBuffs(context.kitEffectState.effects, "finaleOfTheDeepCleared");
    expect(buffs.map(({ attribute, secondsRemaining }) => ({ attribute, secondsRemaining }))).toStrictEqual([
      { attribute: Attribute.Attack, secondsRemaining: 8 },
    ]);
    expect(takeOne(buffs).amount).toBeCloseTo(75);
  });

  test("the flat ATK a clear raises is at most the rank's maximum", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeClearedShare = 1;
    finaleOfTheDeepPassiveModule.onKitEvent?.(clearHealth(0.01), context, wielder);

    expect(takeOne(getBuffs(context.kitEffectState.effects, "finaleOfTheDeepCleared")).amount).toBe(90);
  });

  test("a heal that takes no Bond of Life clears nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeClearedShare = 0.25;
    finaleOfTheDeepPassiveModule.onKitEvent?.(
      { ...clearHealth(0), bondOfLifeShare: 0, healthShare: 0.25 },
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects, "finaleOfTheDeepCleared")).toStrictEqual([]);
  });
});
