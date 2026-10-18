import { createParty } from "#src/services/party/createParty";
import { spendDew } from "#src/services/party/spendDew";
import { describe, expect, test } from "vitest";

describe(spendDew, () => {
  test("spends Verdant Dew before Moonridge Dew, as gcsim's ConsumeDew does", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.verdantDew.count = 2;
    party.moonridgeDew = 2;

    expect(spendDew(party, 3)).toBe(3);
    expect(party.verdantDew.count).toBe(0);
    expect(party.moonridgeDew).toBe(1);
  });

  test("spends no more than the most it is asked for", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.verdantDew.count = 3;
    party.moonridgeDew = 3;

    expect(spendDew(party, 2)).toBe(2);
    expect(party.verdantDew.count).toBe(1);
    expect(party.moonridgeDew).toBe(3);
  });
});
