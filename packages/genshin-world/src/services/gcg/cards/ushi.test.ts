import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { ARATAKI_ITTO_ID, STONEHIDE_ID, USHI_ID } from "#src/services/gcg/cards/constants";
import { createDuel } from "#src/services/gcg/cards/createDuel.test";
import { createSideState } from "#src/services/gcg/cards/createSideState.test";
import { stonehide } from "#src/services/gcg/cards/stonehide";
import { ushi } from "#src/services/gcg/cards/ushi";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { reduceGcgReceivedDamage } from "#src/services/gcg/reduceGcgReceivedDamage";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("ushi", () => {
  test("a hit Stonehide takes to 0 spends none of Ushi's usage, counter or Superlative attach", () => {
    expect.hasAssertions();

    const stonehideZoneCard = createGcgZoneCard(STONEHIDE_ID, stonehide);
    const ushiZoneCard = createGcgZoneCard(USHI_ID, ushi);
    const duel = createDuel([
      {
        ...createSideState([
          { ...createGcgCharacterState({ character: { element: Element.Geo, id: 1 } }), statuses: [stonehideZoneCard] },
          createGcgCharacterState({ character: { element: Element.Geo, id: ARATAKI_ITTO_ID } }),
        ]),
        summons: [ushiZoneCard],
      },
      createSideState([createGcgCharacterState({ character: { element: Element.Geo, id: 1 } })]),
    ]);

    const reduced = reduceGcgReceivedDamage(duel, 0, { damageType: GcgDamageKind.Physical, value: 1 });
    const side = takeOne(duel.sides, 0);
    expect({
      damage: reduced.value,
      ittoStatusCount: takeOne(side.characters, 1).statuses.length,
      stonehideUsages: stonehideZoneCard.usages,
      ushi: { counter: ushiZoneCard.counter, usages: ushiZoneCard.usages },
    }).toStrictEqual({ damage: 0, ittoStatusCount: 0, stonehideUsages: 2, ushi: { counter: 1, usages: 0 } });
  });
});
