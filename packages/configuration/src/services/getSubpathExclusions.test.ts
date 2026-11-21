import { getSubpathExclusions } from "#src/services/getSubpathExclusions";
import { describe, expect, test } from "vitest";

describe(getSubpathExclusions, () => {
  test("leaves out the folder an arm names by its index", () => {
    expect.hasAssertions();

    expect(
      getSubpathExclusions({
        exports: { "./workers": { default: "./dist/workers.js", source: "./src/workers/index.ts" } },
      }),
    ).toStrictEqual(["workers"]);
  });

  test("leaves out the module an arm names by its file, nested or not", () => {
    expect.hasAssertions();

    expect(
      getSubpathExclusions({
        exports: {
          "./constants": { default: "./dist/constants.js", source: "./src/services/constants.ts" },
          "./save": { default: "./dist/save.js", source: "./src/save.ts" },
        },
      }),
    ).toStrictEqual(["services/constants.ts", "save.ts"]);
  });

  test("leaves out nothing for the root, the manifest itself, or an arm outside src", () => {
    expect.hasAssertions();

    expect(
      getSubpathExclusions({
        exports: {
          ".": { default: "./dist/index.js", source: "./src/index.ts" },
          "./package.json": "./package.json",
          "./style.css": "./dist/style.css",
        },
      }),
    ).toStrictEqual([]);
  });

  test("leaves out nothing for a manifest with no exports", () => {
    expect.hasAssertions();

    expect(getSubpathExclusions({ name: "" })).toStrictEqual([]);
  });
});
