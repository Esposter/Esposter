import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { applyDomainDisorder } from "#src/services/domains/applyDomainDisorder";
import { clearDomainDisorders } from "#src/services/domains/clearDomainDisorders";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;
const SECONDS = 300;
const FIRE = "LevelEntity_ElementAddHurt_Fire";

describe(clearDomainDisorders, () => {
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
