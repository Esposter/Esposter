import { describe, expect, test } from "vitest";

import { NO_WAYPOINTS_ANSWER } from "../constants";
import { parseWaypoints } from "./parseWaypoints";

describe(parseWaypoints, () => {
  test("keeps one step per line and drops list markers and blank lines", () => {
    expect.hasAssertions();

    expect(parseWaypoints("- a\n\n2. b\n* c")).toStrictEqual(["a", "b", "c"]);
  });

  test("keeps at most three", () => {
    expect.hasAssertions();

    expect(parseWaypoints("a\nb\nc\nd")).toStrictEqual(["a", "b", "c"]);
  });

  test.each([NO_WAYPOINTS_ANSWER, ""])("answers no step for %s", (answer) => {
    expect.hasAssertions();

    expect(parseWaypoints(answer)).toStrictEqual([]);
  });
});
