import { countDew } from "#src/services/party/countDew";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

describe(countDew, () => {
  test("counts both the Verdant Dew and the Moonridge Dew the party holds", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.verdantDew.count = 1;
    party.moonridgeDew = 2;

    expect(countDew(party)).toBe(3);
  });
});
