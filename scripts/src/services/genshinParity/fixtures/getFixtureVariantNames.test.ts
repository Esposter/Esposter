import { getFixtureVariantNames } from "#src/services/genshinParity/fixtures/getFixtureVariantNames";
import { describe, expect, test } from "vitest";

describe(getFixtureVariantNames, () => {
  test("lists the keys of a variants object written over many lines", () => {
    expect.hasAssertions();

    const fixture = `import { Tab } from "#src/models/Tab";\n\nexport const variants = {\n  artifacts: {},\n  empty: { options: [] },\n};\n`;

    expect(getFixtureVariantNames(fixture)).toStrictEqual(["artifacts", "empty"]);
  });

  test("lists the keys of a variants object written on one line", () => {
    expect.hasAssertions();

    const fixture = `export const variants = { five: { count: 150, rarity: 5 }, four: { count: 5, rarity: 4 } };\n`;

    expect(getFixtureVariantNames(fixture)).toStrictEqual(["five", "four"]);
  });

  test("lists nothing for a fixture that exports no variants", () => {
    expect.hasAssertions();

    const fixture = `export const props = { isFolded: true, progress: 1 };\n`;

    expect(getFixtureVariantNames(fixture)).toStrictEqual([]);
  });
});
