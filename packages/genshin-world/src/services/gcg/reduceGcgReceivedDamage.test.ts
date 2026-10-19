import { Element } from "#src/models/Element";
import { LOTUS_FLOWER_CRISP_ID } from "#src/services/gcg/cards/constants";
import { createDuel } from "#src/services/gcg/cards/createDuel.test";
import { createSideState } from "#src/services/gcg/cards/createSideState.test";
import { iceLotus } from "#src/services/gcg/cards/iceLotus";
import { lotusFlowerCrisp } from "#src/services/gcg/cards/lotusFlowerCrisp";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { reduceGcgReceivedDamage } from "#src/services/gcg/reduceGcgReceivedDamage";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(reduceGcgReceivedDamage, () => {
  test("an onstage card reduces the damage its side's active character takes, and spends a usage", () => {
    expect.hasAssertions();
    const ICE_LOTUS_ID = 111_012;
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { element: Element.Dendro, id: 1701 } })]),
      createSideState([createGcgCharacterState({ character: { element: Element.Dendro, id: 1203 } })]),
    ]);
    const zoneCard = createGcgZoneCard(ICE_LOTUS_ID, iceLotus);
    takeOne(duel.sides, 0).onstages.push(zoneCard);
    const damage = reduceGcgReceivedDamage(duel, 0, { damageType: Element.Cryo, value: 3 });
    expect(damage).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    expect(zoneCard.usages).toBe(1);
  });

  test("a status on the active character reduces the damage it takes", () => {
    expect.hasAssertions();
    const character = {
      ...createGcgCharacterState({ character: { element: Element.Dendro, id: 1701 } }),
      statuses: [createGcgZoneCard(LOTUS_FLOWER_CRISP_ID, lotusFlowerCrisp)],
    };
    const duel = createDuel([
      createSideState([character]),
      createSideState([createGcgCharacterState({ character: { element: Element.Dendro, id: 1203 } })]),
    ]);
    const damage = reduceGcgReceivedDamage(duel, 0, { damageType: Element.Pyro, value: 5 });
    expect(damage).toStrictEqual({ damageType: Element.Pyro, value: 2 });
  });

  test("a status on a standby character does not reduce the damage the active one takes", () => {
    expect.hasAssertions();
    const standby = {
      ...createGcgCharacterState({ character: { element: Element.Dendro, id: 1403 } }),
      statuses: [createGcgZoneCard(LOTUS_FLOWER_CRISP_ID, lotusFlowerCrisp)],
    };
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { element: Element.Dendro, id: 1701 } }), standby]),
      createSideState([createGcgCharacterState({ character: { element: Element.Dendro, id: 1203 } })]),
    ]);
    const damage = reduceGcgReceivedDamage(duel, 0, { damageType: Element.Pyro, value: 5 });
    expect(damage).toStrictEqual({ damageType: Element.Pyro, value: 5 });
  });
});
