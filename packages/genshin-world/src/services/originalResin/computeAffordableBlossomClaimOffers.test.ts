import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { computeAffordableBlossomClaimOffers } from "#src/services/originalResin/computeAffordableBlossomClaimOffers";
import { CONDENSED_RESIN_CLAIM_COUNT } from "#src/services/originalResin/constants";
import { describe, expect, test } from "vitest";

describe(computeAffordableBlossomClaimOffers, () => {
  const LEY_LINE_CLAIM_RESIN = 20;
  const CONDENSED_RESIN_OFFER = { claimCount: CONDENSED_RESIN_CLAIM_COUNT, condensedResinCount: 1, resin: 0 };

  test("the claims the held resin affords are offered, Condensed Resin among them at a ley line or a domain", () => {
    expect.hasAssertions();

    expect(computeAffordableBlossomClaimOffers(BlossomKind.LeyLine, 0, 2 * LEY_LINE_CLAIM_RESIN, 1)).toStrictEqual([
      { claimCount: 1, condensedResinCount: 0, resin: LEY_LINE_CLAIM_RESIN },
      { claimCount: 2, condensedResinCount: 0, resin: 2 * LEY_LINE_CLAIM_RESIN },
      CONDENSED_RESIN_OFFER,
    ]);
    expect(computeAffordableBlossomClaimOffers(BlossomKind.LeyLine, 0, LEY_LINE_CLAIM_RESIN, 0)).toStrictEqual([
      { claimCount: 1, condensedResinCount: 0, resin: LEY_LINE_CLAIM_RESIN },
    ]);
    expect(computeAffordableBlossomClaimOffers(BlossomKind.Domain, 0, 0, 1)).toStrictEqual([CONDENSED_RESIN_OFFER]);
  });

  test("a blossom the held resin does not afford offers nothing", () => {
    expect.hasAssertions();

    expect(computeAffordableBlossomClaimOffers(BlossomKind.LeyLine, 0, LEY_LINE_CLAIM_RESIN - 1, 0)).toStrictEqual([]);
    expect(computeAffordableBlossomClaimOffers(BlossomKind.NormalBoss, 0, 39, 0)).toStrictEqual([]);
  });
});
