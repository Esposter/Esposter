import { PartySwitchResult } from "#src/models/party/PartySwitchResult";
import { PARTY_FALL_SECONDS, PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { stepPartyFall } from "#src/services/party/stepPartyFall";
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

  test("switching is locked while the fall plays", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    damagePartyMember(party, 1, 1);
    const locked = switchPartyMember(party, 1, 10);
    const activeIndexWhileFalling = party.activeIndex;
    stepPartyFall(party, PARTY_FALL_SECONDS);
    const released = switchPartyMember(party, 1, 10);

    expect({ activeIndex: party.activeIndex, activeIndexWhileFalling, locked, released }).toStrictEqual({
      activeIndex: 1,
      activeIndexWhileFalling: 0,
      locked: PartySwitchResult.Falling,
      released: PartySwitchResult.Switched,
    });
  });
});
