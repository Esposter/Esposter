import { getNonImportLines } from "#src/services/sweeps/duplicateCode/getNonImportLines";
import { describe, expect, test } from "vitest";

describe(getNonImportLines, () => {
  test("reads an import declaration spread over several lines as no code", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import {\na,\n} from "a";\nb`)).toStrictEqual(new Set([4]));
  });

  test("reads a blank line as no code", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a";\n\nb`)).toStrictEqual(new Set([3]));
  });

  test("closes an import declaration followed by a trailing comment", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a"; // a\nb`)).toStrictEqual(new Set([2]));
  });

  test("closes an import declaration with import attributes", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a.json" with { type: "json" };\nb`)).toStrictEqual(new Set([2]));
  });
});
