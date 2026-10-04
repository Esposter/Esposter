import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getComponentName } from "@esposter/configuration";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A screen's image in the visual suite only holds it still; what says it matches the game is `compare` against a
 * reference. A screen with a fixture and no reference therefore reaches the suite without ever being compared, and
 * its approved image locks in whatever it draws. Every screen the suite shoots is held to having a reference here,
 * and every reference to a screen that exists, so `compare --all` scores them all.
 */
describe("parityReferenceMap", () => {
  const COMPONENTS_DIRECTORY = join(REPOSITORY_ROOT, "packages/genshin-world/src/components");
  // Each screen is a folder holding its `Index.vue` and `Index.fixture.ts`, named by its path as the package's barrel
  // Names it
  const FIXTURE_FILE = "Index.fixture.ts";
  // A motion-only fixture is shot on the parity page but kept out of the suite
  const MOTION_ONLY_REGEX = /export const isMotionOnly = true/u;
  const fixturePaths = readdirSync(COMPONENTS_DIRECTORY, { recursive: true })
    .map(String)
    .filter((path) => basename(path) === FIXTURE_FILE)
    .map((path) => join(COMPONENTS_DIRECTORY, path));
  const toScreen = (path: string): string =>
    getComponentName(relative(COMPONENTS_DIRECTORY, path).replace(/\.fixture\.ts$/u, ".vue"));
  const referencedScreens = new Set(Object.values(ParityReferenceMap).map(({ screen }) => screen));

  test("names a reference for every screen the visual suite shoots", () => {
    expect.hasAssertions();

    const stillScreens = fixturePaths
      .filter((path) => !MOTION_ONLY_REGEX.test(readFileSync(path, "utf8")))
      .map((path) => toScreen(path));

    expect(stillScreens.filter((screen) => !referencedScreens.has(screen))).toStrictEqual([]);
  });

  test("names only screens the parity page shoots", () => {
    expect.hasAssertions();

    const screens = new Set(fixturePaths.map((path) => toScreen(path)));

    expect([...referencedScreens].filter((screen) => !screens.has(screen))).toStrictEqual([]);
  });
});
