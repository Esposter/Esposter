import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createParty } from "#src/services/party/createParty";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { createTalesOfTheTundraPassiveModule } from "#src/services/weapon/passives/createTalesOfTheTundraPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(createTalesOfTheTundraPassiveModule, () => {
  const CHARACTER_IDS = [TRAVELER_CHARACTER_ID, 1, 2];
  // Tales of the Tundra at its first rank: 120 Elemental Mastery with three different Elemental Types in the party
  const passiveModule = createTalesOfTheTundraPassiveModule([120]);
  // The deployed team the elements draw, its first member the wielder, each member in its element
  const getTeamBonuses = (elements: Element[]) => {
    const members = elements.map((element, index) => ({
      ...createWielderCombatant(),
      characterId: takeOne(CHARACTER_IDS, index),
      element,
    }));
    const wielder = takeOne(members, 0);
    const characterIdCombatantMap = new Map(members.map((member) => [member.characterId, member]));
    const party = createParty(members.map(({ characterId }) => characterId));
    return passiveModule.getPassiveBonuses?.(wielder, 1, getDeployedCombatants(party, characterIdCombatantMap), []);
  };

  test("a party of three different Elemental Types raises the wielder's Elemental Mastery by the rank's amount", () => {
    expect.hasAssertions();

    expect(getTeamBonuses([Element.Pyro, Element.Hydro, Element.Anemo])).toStrictEqual([
      { amount: 120, attribute: Attribute.ElementalMastery },
    ]);
  });

  test("a party of two Elemental Types raises nothing", () => {
    expect.hasAssertions();

    expect(getTeamBonuses([Element.Pyro, Element.Pyro, Element.Hydro])).toStrictEqual([]);
  });
});
