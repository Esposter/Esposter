import { getFileTypeShims } from "#src/services/dependencies/score/getFileTypeShims";
import { describe, expect, test } from "vitest";

describe(getFileTypeShims, () => {
  test("counts a declared module, and a directive and a cast beside an import or a call of its package", () => {
    expect.hasAssertions();

    const text = [
      'declare module "alpha/types" {',
      "  export const a: number;",
      "}",
      'import { ping } from "beta";',
      "// @ts-expect-error",
      "ping(1);",
      "const value = ping(2) as unknown as number;",
    ].join("\n");

    expect(getFileTypeShims(text)).toStrictEqual(
      new Map([
        ["alpha", 1],
        ["beta", 2],
      ]),
    );
  });

  test("counts a cast of a dollar-named binding, whose name is escaped in the call's pattern", () => {
    expect.hasAssertions();

    const text = ['import { $t } from "vue-i18n";', 'const label = $t("a") as unknown as string;'].join("\n");

    expect(getFileTypeShims(text)).toStrictEqual(new Map([["vue-i18n", 1]]));
  });

  test("counts nothing for a directive with no import beside it", () => {
    expect.hasAssertions();

    const text = ["const first = 1;", "// @ts-expect-error", "const second = 2;"].join("\n");

    expect(getFileTypeShims(text)).toStrictEqual(new Map());
  });
});
