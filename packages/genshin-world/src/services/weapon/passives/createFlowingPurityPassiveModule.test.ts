import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createFlowingPurityPassiveModule } from "#src/services/weapon/passives/createFlowingPurityPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.BaseHealth, value: 10000 }]);
// Flowing Purity at its first rank: eight per cent All Elemental DMG Bonus for fifteen seconds after an Elemental Skill, with a
// Bond of Life worth a quarter of Max HP once every ten seconds, and two per cent All Elemental DMG Bonus for every 1,000 HP
// The bond cleared, at most twelve per cent, for fifteen seconds
const flowingPurityPassiveModule = createFlowingPurityPassiveModule([0.08, 15, 0.24, 0.02, 0.12, 15, 10]);
const skillUsed = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const };
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

describe(createFlowingPurityPassiveModule, () => {
  test("an Elemental Skill raises every element's DMG Bonus by the rank's percentage for the rank's seconds, and grants a Bond of Life worth the rank's share of Max HP", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    flowingPurityPassiveModule.onKitEvent?.(skillUsed, context, wielder);

    const buffs = getBuffs(context.kitEffectState.effects, "flowingPurity");
    expect(
      buffs.map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual(
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.08, attribute, secondsRemaining: 15 })),
    );
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).bondOfLifeShare).toBe(0.24);
  });

  test("a clear raises every element's DMG Bonus by two per cent for each 1,000 HP it cleared, for fifteen seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeClearedShare = 0.5;
    flowingPurityPassiveModule.onKitEvent?.(clearHealth(0.5), context, wielder);

    const buffs = getBuffs(context.kitEffectState.effects, "flowingPurityCleared");
    expect(
      buffs.map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual(
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.1, attribute, secondsRemaining: 15 })),
    );
  });

  test("the DMG Bonus a clear raises is at most the rank's maximum", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeClearedShare = 1;
    flowingPurityPassiveModule.onKitEvent?.(clearHealth(0.01), context, wielder);

    const buffs = getBuffs(context.kitEffectState.effects, "flowingPurityCleared");
    expect(buffs.map(({ amount, attribute }) => ({ amount, attribute }))).toStrictEqual(
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.12, attribute })),
    );
  });
});
