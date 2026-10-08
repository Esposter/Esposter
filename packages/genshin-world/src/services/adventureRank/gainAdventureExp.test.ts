import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK, MORA_PER_EXCESS_ADVENTURE_EXP } from "#src/services/adventureRank/constants";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { describe, expect, test } from "vitest";

describe(gainAdventureExp, () => {
  const noQuest = new Set<string>();
  const gain = computeAdventureExpAtRank(2);
  const maxAdventureExp = computeAdventureExpAtRank(MAX_ADVENTURE_RANK);

  test("eXP is added and no Mora paid below the total", () => {
    expect.hasAssertions();

    expect(gainAdventureExp(0, gain, noQuest)).toStrictEqual({ adventureExp: gain, moraPaid: 0 });
  });

  test("eXP past the total of a held rank is not gained, and no Mora is paid for it", () => {
    expect.hasAssertions();

    expect(gainAdventureExp(maxAdventureExp, gain, noQuest)).toStrictEqual({
      adventureExp: maxAdventureExp,
      moraPaid: 0,
    });
  });

  test("eXP past the total at rank 60 is paid in Mora, ten a point", () => {
    expect.hasAssertions();

    const ascensionQuests = new Set(["25001", "25005", "25009", "25011"]);

    expect(gainAdventureExp(maxAdventureExp, gain, ascensionQuests)).toStrictEqual({
      adventureExp: maxAdventureExp,
      moraPaid: gain * MORA_PER_EXCESS_ADVENTURE_EXP,
    });
  });
});
