import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createFinaleOfTheDeepPassiveModule } from "#src/services/weapon/passives/createFinaleOfTheDeepPassiveModule";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10000 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Finale of the Deep at its first rank: twelve per cent ATK for fifteen seconds after an Elemental Skill, with a Bond of Life
// Worth a quarter of Max HP once every ten seconds, and 2.4% of the HP a Bond of Life cleared as flat ATK, at most 150, for fifteen seconds
const finaleOfTheDeepPassiveModule = createFinaleOfTheDeepPassiveModule([0.12, 15, 0.25, 0.024, 150, 15, 10]);
const skillUsed = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const };
const getBuffs = (effects: readonly KitEffect[], source: string) =>
  effects.filter((effect): effect is KitBuff => effect.kind === "buff" && effect.source === source);
const clearHealth = (bondOfLifeShare: number) => ({
  bondOfLifeShare,
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: 0,
  kind: KitEventKind.HealthChanged as const,
  overflowHealthShare: 0,
});

describe(createFinaleOfTheDeepPassiveModule, () => {
  test("an Elemental Skill raises the wielder's ATK by the rank's percentage for the rank's seconds, and grants a Bond of Life worth the rank's share of its Max HP", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    finaleOfTheDeepPassiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(getBuffs(context.kitEffectState.effects, "finaleOfTheDeep")).toStrictEqual([
      {
        amount: 0.12,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 15,
        source: "finaleOfTheDeep",
      },
    ]);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).bondOfLifeShare).toBe(0.25);
  });

  test("a second Elemental Skill inside the rank's cooldown grants nothing, and one after it grants again", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    finaleOfTheDeepPassiveModule.onKitEvent?.(skillUsed, context, wielder);
    finaleOfTheDeepPassiveModule.onKitEvent?.(skillUsed, context, wielder);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).bondOfLifeShare).toBe(0.25);

    stepKitSeconds(context, 10.5);
    finaleOfTheDeepPassiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).bondOfLifeShare).toBe(0.5);
  });

  test("a Bond of Life cleared raises the wielder's flat ATK by 2.4% of the HP it cleared, for fifteen seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeClearedShare = 0.25;
    finaleOfTheDeepPassiveModule.onKitEvent?.(clearHealth(0.25), context, wielder);

    const buffs = getBuffs(context.kitEffectState.effects, "finaleOfTheDeepCleared");
    expect(buffs.map(({ attribute, secondsRemaining }) => ({ attribute, secondsRemaining }))).toStrictEqual([
      { attribute: Attribute.Attack, secondsRemaining: 15 },
    ]);
    expect(takeOne(buffs).amount).toBeCloseTo(60);
  });

  test("the flat ATK a clear raises is at most the rank's maximum", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeClearedShare = 1;
    finaleOfTheDeepPassiveModule.onKitEvent?.(clearHealth(0.01), context, wielder);

    expect(takeOne(getBuffs(context.kitEffectState.effects, "finaleOfTheDeepCleared")).amount).toBe(150);
  });

  test("a heal that takes no Bond of Life clears nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeClearedShare = 0.25;
    finaleOfTheDeepPassiveModule.onKitEvent?.(
      { ...clearHealth(0), healthShare: 0.25, bondOfLifeShare: 0 },
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects, "finaleOfTheDeepCleared")).toStrictEqual([]);
  });
});
