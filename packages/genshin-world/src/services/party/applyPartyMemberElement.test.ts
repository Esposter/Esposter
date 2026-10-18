import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { advanceElementalState } from "#src/services/combat/aura/advanceElementalState";
import { applyPartyMemberElement } from "#src/services/party/applyPartyMemberElement";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

describe(applyPartyMemberElement, () => {
  test("fervent flames shortens a cryo affliction on a member", () => {
    expect.hasAssertions();
    const GAUGE = 1;
    const STEP_SECONDS = 0.01;
    // The seconds a Cryo affliction on the member lasts, counted by stepping its elemental state until it is gone
    const getAfflictionSeconds = (elementalResonances: Element[]): number => {
      const party = createParty([TRAVELER_CHARACTER_ID]);
      applyPartyMemberElement(party, TRAVELER_CHARACTER_ID, Element.Cryo, GAUGE, elementalResonances);
      const { elementalState } = getPartyMember(party, TRAVELER_CHARACTER_ID);
      let seconds = 0;
      while (elementalState.auras.has(AuraType.Cryo)) {
        advanceElementalState(elementalState, STEP_SECONDS, []);
        seconds += STEP_SECONDS;
      }
      return seconds;
    };

    expect(getAfflictionSeconds([Element.Pyro]) / getAfflictionSeconds([])).toBeCloseTo(0.6, 1);
  });
});
