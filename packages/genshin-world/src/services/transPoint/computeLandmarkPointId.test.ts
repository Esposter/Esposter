import { computeLandmarkPointId } from "#src/services/transPoint/computeLandmarkPointId";
import { describe, expect, test } from "vitest";

describe(computeLandmarkPointId, () => {
  test("a waypoint and a Statue of the New Moon are keyed by the point their ids end in", () => {
    expect.hasAssertions();

    expect([
      computeLandmarkPointId("nod-krai-new-moon-statue-1515"),
      computeLandmarkPointId("mondstadt-waypoint-1865"),
    ]).toStrictEqual([1515, 1865]);
  });

  test("a domain entrance has no point to key by", () => {
    expect.hasAssertions();

    expect(computeLandmarkPointId("domain-entrance-1")).toBeUndefined();
  });
});
