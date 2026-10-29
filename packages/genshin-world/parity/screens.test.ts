import { pendingScreens } from "#parity/pendingScreens";
import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join, normalize } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A screen folder is one whose `Index.vue` sits in a `Screen` folder. Each one is either shot by the parity page
 * through its fixture, or named in `pendingScreens` with the reason it has no reference yet, so a screen can never
 * reach the suite without anyone having decided that.
 */
describe("screens", () => {
  const COMPONENTS_DIRECTORY = join(import.meta.dirname, "../src/components");
  const FIXTURE_FILE = "Index.fixture.ts";
  const screenDirectories = readdirSync(COMPONENTS_DIRECTORY, { recursive: true })
    .map(String)
    .filter((path) => basename(path) === "Index.vue" && basename(dirname(path)) === "Screen")
    .map((path) => normalize(dirname(path)));

  test("every screen folder is referenced or named pending", () => {
    expect.hasAssertions();

    const pending = new Set(pendingScreens.map(({ directory }) => normalize(directory)));
    const uncovered = screenDirectories.filter(
      (directory) => !existsSync(join(COMPONENTS_DIRECTORY, directory, FIXTURE_FILE)) && !pending.has(directory),
    );

    expect(uncovered).toStrictEqual([]);
  });

  test("names only screen folders that have no fixture", () => {
    expect.hasAssertions();

    const stale = pendingScreens.filter(
      ({ directory }) =>
        !screenDirectories.includes(normalize(directory)) ||
        existsSync(join(COMPONENTS_DIRECTORY, directory, FIXTURE_FILE)),
    );

    expect(stale).toStrictEqual([]);
  });
});
