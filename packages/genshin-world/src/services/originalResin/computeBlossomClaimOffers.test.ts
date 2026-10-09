import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { computeBlossomClaimOffers } from "#src/services/originalResin/computeBlossomClaimOffers";
import { CONDENSED_RESIN_CLAIM_COUNT } from "#src/services/originalResin/constants";
import { describe, expect, test } from "vitest";

describe(computeBlossomClaimOffers, () => {
  test("a ley line or a domain offers one claim, two claims at twice the price, or a Condensed Resin for its three", () => {
    expect.hasAssertions();

    expect(computeBlossomClaimOffers(BlossomKind.LeyLine, 0)).toStrictEqual([
      { claimCount: 1, condensedResinCount: 0, resin: 20 },
      { claimCount: 2, condensedResinCount: 0, resin: 40 },
      { claimCount: CONDENSED_RESIN_CLAIM_COUNT, condensedResinCount: 1, resin: 0 },
    ]);
    expect(computeBlossomClaimOffers(BlossomKind.Domain, 0)).toHaveLength(3);
  });

  test("a normal boss offers one claim only, and a weekly boss its one claim at the price of its week", () => {
    expect.hasAssertions();

    expect(computeBlossomClaimOffers(BlossomKind.NormalBoss, 0)).toStrictEqual([
      { claimCount: 1, condensedResinCount: 0, resin: 40 },
    ]);
    expect(computeBlossomClaimOffers(BlossomKind.WeeklyBoss, 0)).toStrictEqual([
      { claimCount: 1, condensedResinCount: 0, resin: 30 },
    ]);
  });
});
