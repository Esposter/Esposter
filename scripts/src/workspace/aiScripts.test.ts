import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readJsonFile } from "#src/workspace/readJsonFile.test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The `ai:` scripts are the ones no person types, so the catalogue page is the only place a session learns one
 * exists. Each row carries what the script prints, which the manifest cannot, so the page is written by hand —
 * and a script added without its row, or a row outliving its script, fails nothing else.
 */
describe("aiScripts", () => {
  const AI_SCRIPT_PREFIX = "ai:";
  const CATALOGUE_SCRIPT_REGEX = /^\| `pnpm (?<script>ai:[\w:-]+)/gmu;
  const cataloguePath = resolve(REPOSITORY_ROOT, SKILLS_DIRECTORY, "package-scripts/references/ai-scripts.md");

  test("the catalogue lists exactly the root manifest's ai: scripts", () => {
    expect.hasAssertions();

    const { scripts } = readJsonFile(resolve(REPOSITORY_ROOT, PACKAGE_JSON_FILENAME));
    const manifestScripts = Object.keys(scripts as Record<string, string>)
      .filter((script) => script.startsWith(AI_SCRIPT_PREFIX))
      .toSorted();
    const catalogue = readFileSync(cataloguePath, "utf8");
    const catalogueScripts = Array.from(catalogue.matchAll(CATALOGUE_SCRIPT_REGEX), ({ groups }) => groups?.script)
      .filter((script) => script !== undefined)
      .toSorted();

    expect(catalogueScripts).toStrictEqual(manifestScripts);
  });
});
