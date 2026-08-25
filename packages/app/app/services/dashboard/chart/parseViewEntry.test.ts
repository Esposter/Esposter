import { DASHBOARD_VIEW_SEPARATOR } from "@/services/dashboard/chart/constants";
import { parseViewEntry } from "@/services/dashboard/chart/parseViewEntry";
import { describe, expect, test } from "vitest";

describe(parseViewEntry, () => {
  const visualId = crypto.randomUUID();

  // The encoder is free to put the separator inside the token, so only the first one delimits
  test("splits on the first separator and keeps the rest of the token verbatim", () => {
    expect.hasAssertions();

    const token = `a${DASHBOARD_VIEW_SEPARATOR}b`;

    expect(parseViewEntry(`${visualId}${DASHBOARD_VIEW_SEPARATOR}${token}`)).toStrictEqual({ token, visualId });
  });

  test("names no visual when the entry carries no separator", () => {
    expect.hasAssertions();

    expect(parseViewEntry(visualId)).toStrictEqual({ token: "", visualId: "" });
  });
});
