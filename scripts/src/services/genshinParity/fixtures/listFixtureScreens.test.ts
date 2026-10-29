import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { FixtureReferenceStatus } from "#src/models/genshinParity/fixtures/FixtureReferenceStatus";
import {
  BARREL_FILE_NAME,
  COMPONENT_FILE_NAME,
  FIXTURE_FILE_NAME,
  IMAGE_NAME,
} from "#src/services/genshinParity/fixtures/constants";
import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe(listFixtureScreens, () => {
  const SCREEN_NAME = "FooScreen";
  const SCREEN_DIRECTORY = join("Foo", "Screen");
  const REFERENCE_ID = "foo-screen";
  const REPORTED_MEAN = 2.5;
  let componentsDirectory = "";

  beforeEach(async () => {
    componentsDirectory = await mkdtemp(join(tmpdir(), "fixtures-"));
    await mkdir(join(componentsDirectory, SCREEN_DIRECTORY), { recursive: true });
    await writeFile(
      join(componentsDirectory, BARREL_FILE_NAME),
      `export { default as ${SCREEN_NAME} } from "./${SCREEN_DIRECTORY.replaceAll("\\", "/")}/${COMPONENT_FILE_NAME}";\n`,
    );
    await writeFile(
      join(componentsDirectory, SCREEN_DIRECTORY, FIXTURE_FILE_NAME),
      "export const variants = {\n  artifacts: {},\n};\n",
    );
    await writeFile(join(componentsDirectory, SCREEN_DIRECTORY, `${IMAGE_NAME}.png`), "");
  });

  afterEach(async () => {
    await rm(componentsDirectory, { force: true, recursive: true });
  });

  test("should list a screen and each variant, with its image, its reference and that reference's score and bar", async () => {
    expect.hasAssertions();

    const referenceMap = { [REFERENCE_ID]: { screen: SCREEN_NAME, source: "recording.mp4" } } satisfies Record<
      string,
      ParityReference
    >;
    const rows = await listFixtureScreens(componentsDirectory, referenceMap, new Map([[REFERENCE_ID, REPORTED_MEAN]]));

    expect(rows).toStrictEqual([
      {
        bar: DEFAULT_APPROVAL.bar,
        directory: SCREEN_DIRECTORY.replaceAll("\\", "/"),
        imageExists: true,
        lastScore: REPORTED_MEAN,
        name: SCREEN_NAME,
        referenceId: REFERENCE_ID,
        referenceStatus: FixtureReferenceStatus.Entry,
        variant: "",
      },
      {
        bar: null,
        directory: SCREEN_DIRECTORY.replaceAll("\\", "/"),
        imageExists: false,
        lastScore: null,
        name: SCREEN_NAME,
        referenceId: "",
        referenceStatus: FixtureReferenceStatus.None,
        variant: "artifacts",
      },
    ]);
  });
});
