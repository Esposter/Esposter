import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import {
  applyDomainDisorder,
  clearDomainDisorders,
  DOMAIN_DISORDER_SOURCE,
} from "#src/services/domains/applyDomainDisorders";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;
const SECONDS = 300;
const FIRE_SOURCE = `${DOMAIN_DISORDER_SOURCE}:LevelEntity_ElementAddHurt_Fire`;

describe(applyDomainDisorder, () => {
  test("a ley line disorder changes the fight", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    applyDomainDisorder(kitEffectState, createParty([CHARACTER_ID]), "LevelEntity_ElementAddHurt_Fire", SECONDS);
    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.75,
        attribute: Attribute.PyroDamageBonus,
        characterId: CHARACTER_ID,
        kind: "buff",
        secondsRemaining: SECONDS,
        source: FIRE_SOURCE,
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
    applyDomainDisorder(kitEffectState, createParty([CHARACTER_ID]), "LevelEntity_ElementAddHurt_Fire", SECONDS);
    clearDomainDisorders(kitEffectState);
    expect(kitEffectState.effects).toStrictEqual([other]);
  });
});
