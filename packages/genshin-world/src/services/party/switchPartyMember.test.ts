import { PartySwitchResult } from "#src/models/party/PartySwitchResult";
import { PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { describe, expect, test } from "vitest";

describe(switchPartyMember, () => {
  test("puts the member on the field and holds the next switch for the cooldown", () => {
    expect.hasAssertions();

    const party = createParty([1, 2, 3]);
    const switched = switchPartyMember(party, 1, 0);
    const held = switchPartyMember(party, 2, PARTY_SWITCH_COOLDOWN_SECONDS / 2);
    const released = switchPartyMember(party, 2, PARTY_SWITCH_COOLDOWN_SECONDS);

    expect({ activeIndex: party.activeIndex, held, released, switched }).toStrictEqual({
      activeIndex: 2,
      held: PartySwitchResult.Cooldown,
      released: PartySwitchResult.Switched,
      switched: PartySwitchResult.Switched,
    });
  });

  test("refuses a character who is down, and does nothing for an empty slot or the member on the field", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    party.characterIdMemberMap.set(2, { ...createPartyMember(), healthShare: 0 });

    expect([
      switchPartyMember(party, 1, 0),
      switchPartyMember(party, 3, 0),
      switchPartyMember(party, 0, 0),
    ]).toStrictEqual([PartySwitchResult.Down, PartySwitchResult.Unchanged, PartySwitchResult.Unchanged]);
  });
});
