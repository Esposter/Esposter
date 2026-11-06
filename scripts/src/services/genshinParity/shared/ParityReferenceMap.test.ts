import { getFixtureVariantNames } from "#src/services/genshinParity/fixtures/getFixtureVariantNames";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { GENSHIN_WORLD_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { getComponentName } from "@esposter/configuration";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { describe, expect, test } from "vitest";

// A subscreen is covered by an entry naming both its screen and its variant, so an entry for its base alone covers none of its variants
const findSubscreensWithoutEntry = (
  subscreens: readonly { screen: string; variant: string }[],
  entries: readonly { screen: string; variant?: string }[],
) =>
  subscreens.filter(
    ({ screen, variant }) => !entries.some((entry) => entry.screen === screen && entry.variant === variant),
  );

/**
 * A screen's image in the visual suite only holds it still; what says it matches the game is `compare` against a
 * reference. A screen with a fixture and no reference therefore reaches the suite without ever being compared, and
 * its image locks in whatever it draws. Every screen the suite shoots is held to having a reference here,
 * and every reference to a screen that exists, so `compare --all` scores them all.
 */
describe("parityReferenceMap", () => {
  const COMPONENTS_DIRECTORY = join(GENSHIN_WORLD_DIRECTORY, "src", "components");
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

  test("fixture added without a reference", () => {
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

  const subscreens = fixturePaths.flatMap((path) => {
    const screen = toScreen(path);

    return getFixtureVariantNames(readFileSync(path, "utf8")).map((variant) => ({ screen, variant }));
  });

  test("variant with its own reference", () => {
    expect.hasAssertions();

    expect(findSubscreensWithoutEntry(subscreens, Object.values(ParityReferenceMap))).toStrictEqual([]);
  });

  test("variant with no entry", () => {
    expect.hasAssertions();

    expect(findSubscreensWithoutEntry([{ screen: "ArchiveScreen", variant: "dusk" }], [])).toStrictEqual([
      { screen: "ArchiveScreen", variant: "dusk" },
    ]);
  });

  test("variant borrowing its base's reference", () => {
    expect.hasAssertions();

    expect(
      findSubscreensWithoutEntry([{ screen: "ArchiveScreen", variant: "dusk" }], [{ screen: "ArchiveScreen" }]),
    ).toStrictEqual([{ screen: "ArchiveScreen", variant: "dusk" }]);
  });

  test("variant pending with a reason", () => {
    expect.hasAssertions();

    const pendingEntry = { pending: "the dusk light is not recorded yet", screen: "ArchiveScreen", variant: "dusk" };

    expect(findSubscreensWithoutEntry([{ screen: "ArchiveScreen", variant: "dusk" }], [pendingEntry])).toStrictEqual(
      [],
    );
  });

  test("scores no region left of its window's edge", () => {
    expect.hasAssertions();

    // The screen is placed at the window's left edge, so a region reaching left of it scores the pillarbox the page leaves bare
    const leftOfWindow = Object.entries(ParityReferenceMap)
      .filter(([, { region, windowLeft }]) => region !== undefined && windowLeft !== undefined && region.x < windowLeft)
      .map(([id]) => id);

    expect(leftOfWindow).toStrictEqual([]);
  });

  test("holds a manifest row for every reference the map names", async () => {
    expect.hasAssertions();

    // A pending entry names no image, so it has no row; every other one is scored from the image its row holds
    const rowIds = new Set((await readReferenceManifest()).map(({ id }) => id));
    const missingIds = Object.entries(ParityReferenceMap)
      .filter(([, { pending }]) => pending === undefined)
      .map(([id]) => id)
      .filter((id) => !rowIds.has(id));

    expect(missingIds, `no manifest row for ${missingIds.join(", ")}: run references pack`).toStrictEqual([]);
  });

  test("keeps the manifest's reference rows sorted by id", async () => {
    expect.hasAssertions();

    // Each row is written on its own line in id order, so two machines' additions merge by rebase
    const ids = (await readReferenceManifest()).map(({ id }) => id);

    expect(ids).toStrictEqual(ids.toSorted());
  });
});
