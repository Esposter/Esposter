import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";
import { describe, expect, test } from "vitest";

describe(healPartyMember, () => {
  test("restores the share to a standing member, never above all of its HP, and records it with its overflow and healer", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    getPartyMember(party, 1).healthShare = 0.5;
    healPartyMember(party, 1, 0.75, 2);

    expect({ healthChanges: party.healthChanges, healthShare: getPartyMember(party, 1).healthShare }).toStrictEqual({
      healthChanges: [
        { bondOfLifeShare: 0, characterId: 1, healthShare: 0.5, overflowHealthShare: 0.25, sourceCharacterId: 2 },
      ],
      healthShare: 1,
    });
  });

  test("leaves a downed member down and records nothing", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    getPartyMember(party, 1).healthShare = 0;
    healPartyMember(party, 1, 0.5);

    expect({ healthChanges: party.healthChanges, partyMember: getPartyMember(party, 1) }).toStrictEqual({
      healthChanges: [],
      partyMember: { ...createPartyMember(), healthShare: 0 },
    });
  });

  test("a Bond of Life takes the heal before the HP does, and records the share it took", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const partyMember = getPartyMember(party, 1);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeShare = 0.25;
    healPartyMember(party, 1, 0.5);

    expect({
      bondOfLifeShare: partyMember.bondOfLifeShare,
      healthChanges: party.healthChanges,
      healthShare: partyMember.healthShare,
    }).toStrictEqual({
      bondOfLifeShare: 0,
      healthChanges: [{ bondOfLifeShare: 0.25, characterId: 1, healthShare: 0.25, overflowHealthShare: 0 }],
      healthShare: 0.75,
    });
  });

  test("a Bond of Life that takes a whole heal leaves the HP as it was, and still records the heal it took", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const partyMember = getPartyMember(party, 1);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeShare = 0.5;
    healPartyMember(party, 1, 0.25);

    expect({
      bondOfLifeShare: partyMember.bondOfLifeShare,
      healthChanges: party.healthChanges,
      healthShare: partyMember.healthShare,
    }).toStrictEqual({
      bondOfLifeShare: 0.25,
      healthChanges: [{ bondOfLifeShare: 0.25, characterId: 1, healthShare: 0, overflowHealthShare: 0 }],
      healthShare: 0.5,
    });
  });

  test("a Bond of Life counts the share it clears, toward the amount a clear is priced at", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const partyMember = getPartyMember(party, 1);
    partyMember.healthShare = 0.5;
    partyMember.bondOfLifeShare = 0.5;
    healPartyMember(party, 1, 0.25);
    healPartyMember(party, 1, 0.25);

    expect({
      bondOfLifeClearedShare: partyMember.bondOfLifeClearedShare,
      bondOfLifeShare: partyMember.bondOfLifeShare,
    }).toStrictEqual({ bondOfLifeClearedShare: 0.5, bondOfLifeShare: 0 });
  });
});
