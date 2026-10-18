import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createParty } from "#src/services/party/createParty";
import { getReactionParticleDrops } from "#src/services/party/getReactionParticleDrops";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { describe, expect, test } from "vitest";

describe(getReactionParticleDrops, () => {
  test("a listed reaction drops a particle once the cooldown has passed", () => {
    expect.hasAssertions();
    const party = createParty([TRAVELER_CHARACTER_ID]);
    const reactions = [{ element: Element.Electro, reactionType: ReactionType.ElectroCharged }];
    const elementalResonances = [Element.Electro];
    const particle = { count: 1, element: Element.Electro, energyDropKind: EnergyDropKind.Particle };

    expect(getReactionParticleDrops(party, reactions, elementalResonances)).toStrictEqual([particle]);
    stepPartyCooldowns(party, 5);

    expect(getReactionParticleDrops(party, reactions, elementalResonances)).toStrictEqual([particle]);
  });

  test("a reaction within the cooldown drops no particle", () => {
    expect.hasAssertions();
    const party = createParty([TRAVELER_CHARACTER_ID]);
    const reactions = [{ element: Element.Electro, reactionType: ReactionType.ElectroCharged }];
    const elementalResonances = [Element.Electro];
    const particle = { count: 1, element: Element.Electro, energyDropKind: EnergyDropKind.Particle };

    expect(getReactionParticleDrops(party, reactions, elementalResonances)).toStrictEqual([particle]);
    stepPartyCooldowns(party, 4);

    expect(getReactionParticleDrops(party, reactions, elementalResonances)).toStrictEqual([]);
  });
});
