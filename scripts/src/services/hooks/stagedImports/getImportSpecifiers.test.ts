import { getImportSpecifiers } from "#src/services/hooks/stagedImports/getImportSpecifiers";
import { describe, expect, test } from "vitest";

describe(getImportSpecifiers, () => {
  test("reads every import form and ignores commented-out imports and imports quoted in strings", () => {
    expect.hasAssertions();

    expect(
      getImportSpecifiers(
        [
          `import type { A } from "#src/a";`,
          `import "./side";`,
          `export * from "./b";`,
          `const lazy = () => import("./c");`,
          `// import gone from "./commented";`,
          `/* import gone from "./block"; */`,
          `const text = 'import gone from "./quoted"';`,
          `const url = "https://example.com";`,
        ].join("\n"),
      ),
    ).toStrictEqual(["#src/a", "./side", "./b", "./c"]);
  });
});
