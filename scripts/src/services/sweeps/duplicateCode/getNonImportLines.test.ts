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

  test("closes an import declaration whose import attributes span several lines", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a.json" with {\n  type: "json",\n};\nb`)).toStrictEqual(new Set([4]));
  });

  test("does not close import attributes on a brace in a line comment", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a.json" with {\n  type: "json" // }\n};\nb`)).toStrictEqual(new Set([4]));
  });

  test("does not close a single-line import declaration's attributes on a brace in a line comment", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a.json" with { type: "json" // }\n};\nb`)).toStrictEqual(new Set([3]));
  });

  test("keeps import attributes open across a block comment that opens on the brace's line", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a.json" with { /* type\n */ type: "json" };\nb`)).toStrictEqual(
      new Set([3]),
    );
  });

  test("does not close import attributes on a brace in a block comment, and closes on the brace after it", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a.json" with {\n  type: "json" /* } */ }\nb`)).toStrictEqual(new Set([3]));
  });

  test("does not close import attributes on a closing brace line inside a block comment spanning lines", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import a from "a.json" with {\n  /*\n  };\n  */ type: "json" };\nb`)).toStrictEqual(
      new Set([5]),
    );
  });

  test("does not close an import list on a from clause inside a block comment spanning lines", () => {
    expect.hasAssertions();

    expect(getNonImportLines(`import {\n  /*\n  from "x"\n  */ a,\n} from "a";\nb`)).toStrictEqual(new Set([6]));
  });
});
