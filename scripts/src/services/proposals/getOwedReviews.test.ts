import { getOwedReviews } from "#src/services/proposals/getOwedReviews";
import { describe, expect, test } from "vitest";

describe(getOwedReviews, () => {
  const area = "a";
  const passDate = "1970-01-01";
  const shipDate = "1970-01-02";

  test("owes a pass where the last ship is newer than the last pass", () => {
    expect.hasAssertions();

    expect(
      getOwedReviews([{ area, date: shipDate, timestamp: 1 }], [{ areas: [area], date: passDate, timestamp: 0 }]),
    ).toStrictEqual([{ area, lastPassDate: passDate, lastShipDate: shipDate }]);
  });

  test("owes a pass where no pass ever named the area", () => {
    expect.hasAssertions();

    expect(getOwedReviews([{ area, date: shipDate, timestamp: 1 }], [])).toStrictEqual([
      { area, lastPassDate: "", lastShipDate: shipDate },
    ]);
  });

  // A pass that deletes a superseded proposal ships and passes in one commit
  test("owes nothing where the last pass is no older than the last ship", () => {
    expect.hasAssertions();

    expect(
      getOwedReviews([{ area, date: shipDate, timestamp: 1 }], [{ areas: [area], date: shipDate, timestamp: 1 }]),
    ).toStrictEqual([]);
  });
});
