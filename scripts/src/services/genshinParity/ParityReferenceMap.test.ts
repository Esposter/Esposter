import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A screen's image in the visual suite only holds it still; what says it matches the game is `compare` against a
 * reference. A screen with a fixture and no reference therefore reaches the suite without ever being compared, and
 * its approved image locks in whatever it draws. Every screen the suite shoots is held to having a reference here.
 */
describe("parityReferenceMap", () => {
  const INTERFACE_DIRECTORY = join(REPOSITORY_ROOT, "packages/genshin-world/src/components/interface");
  const FIXTURE_SUFFIX = ".fixture.ts";
  // A motion-only fixture is shot on the parity page but kept out of the suite
  const MOTION_ONLY_REGEX = /export const isMotionOnly = true/u;

  test("names a reference for every screen the visual suite shoots", () => {
    expect.hasAssertions();

    const fixturePaths = readdirSync(INTERFACE_DIRECTORY, { recursive: true })
      .map(String)
      .filter((path) => path.endsWith(FIXTURE_SUFFIX))
      .map((path) => join(INTERFACE_DIRECTORY, path));
    const stillScreens = fixturePaths
      .filter((path) => !MOTION_ONLY_REGEX.test(readFileSync(path, "utf8")))
      .map((path) => basename(path, FIXTURE_SUFFIX));
    const referencedScreens = new Set(Object.values(ParityReferenceMap).map(({ screen }) => screen));

    expect(stillScreens.filter((screen) => !referencedScreens.has(screen))).toStrictEqual([]);
  });
});
