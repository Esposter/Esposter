import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The plugin's fixtures are its lists' suites, each linting through the whole plugin, so a list proves its own bans and
// Scope. What the plugin owes is that every list it discovers has such a suite, since a list without one runs unproven
describe("selectorBan", () => {
  test("every list it discovers has a fixture suite beside it", () => {
    expect.hasAssertions();

    const syntaxesDirectory = join(REPOSITORY_ROOT, "scripts", "src", "services", "oxlint", "selectorBan", "syntaxes");

    expect(
      readdirSync(syntaxesDirectory).filter(
        (fileName) =>
          !fileName.endsWith(".test.ts") &&
          !existsSync(join(syntaxesDirectory, fileName.replace(/\.ts$/u, ".test.ts"))),
      ),
    ).toStrictEqual([]);
  });
});
