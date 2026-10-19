import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { applyDomainDisorder } from "#src/services/domains/applyDomainDisorder";
import { getDomainDisorderSource } from "#src/services/domains/getDomainDisorderSource";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

describe(applyDomainDisorder, () => {
  const CHARACTER_ID = 1;
  const SECONDS = 300;
  const FIRE = "LevelEntity_ElementAddHurt_Fire";

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
});
