import { POST_RANKING_AGE_PER_ORDER_OF_MAGNITUDE_MS, POST_RANKING_EPOCH_MS } from "@@/server/services/post/constants";
import { getPostRanking } from "@@/server/services/post/getPostRanking";
import { describe, expect, test } from "vitest";

describe(getPostRanking, () => {
  const createdAt = new Date(POST_RANKING_EPOCH_MS);
  const likes = 10;

  test("ranks a more-liked post above a less-liked one posted at the same time", () => {
    expect.hasAssertions();

    expect(getPostRanking(likes, createdAt)).toBeGreaterThan(getPostRanking(1, createdAt));
  });

  test("ranks a downvoted post below one with no votes", () => {
    expect.hasAssertions();

    expect(getPostRanking(-likes, createdAt)).toBeLessThan(getPostRanking(0, createdAt));
  });

  test("trades one age unit for one order of magnitude of likes", () => {
    expect.hasAssertions();

    const tenLikes = getPostRanking(likes, createdAt);
    const oneAgeUnitNewer = getPostRanking(
      1,
      new Date(POST_RANKING_EPOCH_MS + POST_RANKING_AGE_PER_ORDER_OF_MAGNITUDE_MS),
    );

    expect(oneAgeUnitNewer).toBe(tenLikes);
  });

  test("scores everything before the epoch on votes alone", () => {
    expect.hasAssertions();

    expect(getPostRanking(likes, new Date(0))).toBe(Math.log10(likes));
  });
});
