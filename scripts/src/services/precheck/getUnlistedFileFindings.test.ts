import { getUnlistedFileFindings } from "#src/services/precheck/getUnlistedFileFindings";
import { describe, expect, test } from "vitest";

describe(getUnlistedFileFindings, () => {
  test("names each tracked file no unit holds, and no file a unit holds", () => {
    expect.hasAssertions();

    const unitFiles = new Map([["`a`", ["a/x.ts"]]]);

    expect(getUnlistedFileFindings(unitFiles, ["a/x.ts", "b/y.ts"])).toStrictEqual([
      "unlisted b/y.ts: no unit of the area list holds it, so list it in a row of its area",
    ]);
  });
});
