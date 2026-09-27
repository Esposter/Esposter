import { getOwedReviews } from "#src/services/proposals/getOwedReviews";
import { describe, expect, test } from "vitest";

describe(getOwedReviews, () => {
  const area = "a";
  const passDate = "1970-01-01";
  const shipDate = "1970-01-02";
  const hash = "a";
  const otherHash = "b";

  test("owes a pass where the last ship is newer than the last pass", () => {
    expect.hasAssertions();

    expect(
      getOwedReviews(
        [{ area, date: shipDate, hash, timestamp: 1 }],
        [{ areas: [area], date: passDate, hash: otherHash, timestamp: 0 }],
      ),
    ).toStrictEqual([{ area, lastPassDate: passDate, lastShipDate: shipDate }]);
  });

  test("owes a pass where no pass ever named the area", () => {
    expect.hasAssertions();

    expect(getOwedReviews([{ area, date: shipDate, hash, timestamp: 1 }], [])).toStrictEqual([
      { area, lastPassDate: "", lastShipDate: shipDate },
    ]);
  });

  // A pass that deletes a superseded proposal ships and passes in one commit
  test("owes nothing where the last pass is the last ship's own commit", () => {
    expect.hasAssertions();

    expect(
      getOwedReviews(
        [{ area, date: shipDate, hash, timestamp: 1 }],
        [{ areas: [area], date: shipDate, hash, timestamp: 1 }],
      ),
    ).toStrictEqual([]);
  });

  test("owes a pass where the last pass is another commit in the last ship's second", () => {
    expect.hasAssertions();

    expect(
      getOwedReviews(
        [{ area, date: shipDate, hash, timestamp: 1 }],
        [{ areas: [area], date: shipDate, hash: otherHash, timestamp: 1 }],
      ),
    ).toStrictEqual([{ area, lastPassDate: shipDate, lastShipDate: shipDate }]);
  });
});
