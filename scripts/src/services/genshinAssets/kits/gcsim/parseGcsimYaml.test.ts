import { parseGcsimYaml } from "#src/services/genshinAssets/kits/gcsim/parseGcsimYaml";
import { describe, expect, test } from "vitest";

describe(parseGcsimYaml, () => {
  test("refuses a flow collection that is never closed or holds a delimiter where a value starts", () => {
    expect.hasAssertions();

    expect(() => parseGcsimYaml("box: [1:2]")).toThrow();
    expect(() => parseGcsimYaml("box: [1.2, 3")).toThrow();
    expect(() => parseGcsimYaml("hitlag: { time: 0.03")).toThrow();
  });

  test("refuses a line the top-level mapping does not consume rather than dropping it", () => {
    expect.hasAssertions();

    expect(() => parseGcsimYaml("a: 1\n b: 2\nc: 3")).toThrow();
  });
});
