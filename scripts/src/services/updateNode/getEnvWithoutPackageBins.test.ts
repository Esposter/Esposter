import { getEnvWithoutPackageBins } from "#src/services/updateNode/getEnvWithoutPackageBins";
import { delimiter } from "node:path";
import { describe, expect, test } from "vitest";

describe(getEnvWithoutPackageBins, () => {
  const globalBin = "/a/bin";
  const packageBin = "/a/node_modules/.bin";

  test("takes every node_modules bin folder off the path", () => {
    expect.hasAssertions();

    expect(getEnvWithoutPackageBins({ PATH: [packageBin, globalBin].join(delimiter) })).toStrictEqual({
      PATH: globalBin,
    });
  });

  test("reads the path under Windows' key", () => {
    expect.hasAssertions();

    expect(getEnvWithoutPackageBins({ Path: String.raw`C:\a\node_modules\.bin` })).toStrictEqual({ Path: "" });
  });

  test("leaves every other variable as it is", () => {
    expect.hasAssertions();

    expect(getEnvWithoutPackageBins({ A: packageBin })).toStrictEqual({ A: packageBin });
  });
});
