import { describe, expect, test } from "vitest";
import { parseImportLines } from "#src/services/dependencies/score/parseImportLines";

describe(parseImportLines, () => {
  test("counts each importing file once per package, a scoped name and a subpath alike", () => {
    expect.hasAssertions();

    const output = [
      'apps/web/a.ts:1:import { x } from "alpha";',
      'apps/web/a.ts:2:import { y } from "alpha/sub";',
      'packages/b.vue:4:const c = await import("@scope/beta/deep");',
    ].join("\n");

    expect(parseImportLines(output)).toStrictEqual(
      new Map([
        ["alpha", new Set(["apps/web/a.ts"])],
        ["@scope/beta", new Set(["packages/b.vue"])],
      ]),
    );
  });
});
