import { checkIsDrawn } from "#src/services/genshinParity/componentReference/checkIsDrawn";
import { COMPONENT_REFERENCE_LEDGER_PATH } from "#src/services/genshinParity/componentReference/constants";
import { findHeldComponents } from "#src/services/genshinParity/componentReference/findHeldComponents";
import { findUncoveredComponents } from "#src/services/genshinParity/componentReference/findUncoveredComponents";
import { listComponentPaths } from "#src/services/genshinParity/componentReference/listComponentPaths";
import { readCitedComponents } from "#src/services/genshinParity/componentReference/readCitedComponents";
import { readComponentBarrel } from "#src/services/genshinParity/componentReference/readComponentBarrel";
import { readComponentImports } from "#src/services/genshinParity/componentReference/readComponentImports";
import { readComponentName } from "#src/services/genshinParity/componentReference/readComponentName";
import { readComponentRoots } from "#src/services/genshinParity/componentReference/readComponentRoots";
import { readLedgerFolders } from "#src/services/genshinParity/componentReference/readLedgerFolders";
import { readSpecTexts } from "#src/services/genshinParity/componentReference/readSpecTexts";
import { FIXTURE_FILE_NAME } from "#src/services/genshinParity/fixtures/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A component a Genshin screen draws is held by the game's reference, one of three ways: a referenced parity screen
 * imports it, a spec names it beside its reference, or its folder is a row the component reference ledger owes. The
 * ledger is debt, so a row names what its folder still lacks and leaves once the folder is held, and a component no
 * way holds fails here, naming it. A row naming a folder the tree no longer has fails too, so the ledger shrinks.
 */
describe("genshinComponentReference", () => {
  const roots = readComponentRoots();
  const componentPaths = listComponentPaths([...roots.values()]);
  const sources = new Map(componentPaths.map((path) => [path, readFileSync(join(REPOSITORY_ROOT, path), "utf8")]));
  const barrels = new Map(
    Array.from(
      roots,
      ([name, directory]) =>
        [
          name,
          readComponentBarrel(
            posix.join(directory, "index.ts"),
            readFileSync(join(REPOSITORY_ROOT, directory, "index.ts"), "utf8"),
          ),
        ] as const,
    ),
  );
  const imports = new Map(
    componentPaths.map((path) => [path, readComponentImports(path, sources.get(path) ?? "", barrels)]),
  );
  const drawn = componentPaths.filter((path) => checkIsDrawn(sources.get(path) ?? ""));
  const entries = Object.values(ParityReferenceMap);
  const namedScreens = new Set(entries.map(({ screen }) => screen));
  const referencedScreens = new Set(
    entries
      .filter(({ pending, source, wikiTitle }) => pending === undefined && (source ?? wikiTitle) !== undefined)
      .map(({ screen }) => screen),
  );
  const seeds = new Set(componentPaths.filter((path) => referencedScreens.has(readComponentName(path))));
  // A screen the parity page shoots is judged by its own reference, so the walk stops at it
  const screens = new Set(
    componentPaths.filter(
      (path) =>
        namedScreens.has(readComponentName(path)) &&
        existsSync(join(REPOSITORY_ROOT, dirname(path), FIXTURE_FILE_NAME)),
    ),
  );
  const ledgerFolders = readLedgerFolders(readFileSync(COMPONENT_REFERENCE_LEDGER_PATH, "utf8"));
  const held = findHeldComponents(imports, seeds, screens, readCitedComponents(readSpecTexts()));

  test(
    "every drawn component is held by a reference or owed in the ledger",
    () => {
      expect.hasAssertions();

      expect(findUncoveredComponents(drawn, held, ledgerFolders)).toStrictEqual([]);
    },
    TREE_READ_TIMEOUT_MS,
  );

  test("every ledger row names a folder the tree still holds", () => {
    expect.hasAssertions();

    expect(ledgerFolders.filter((folder) => !existsSync(join(REPOSITORY_ROOT, folder)))).toStrictEqual([]);
  });
});
