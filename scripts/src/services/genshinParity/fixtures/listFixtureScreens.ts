import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { COMPONENT_FILE_NAME, FIXTURE_FILE_NAME } from "#src/services/genshinParity/fixtures/constants";
import { getFixtureScreenRow } from "#src/services/genshinParity/fixtures/getFixtureScreenRow";
import { getFixtureVariantNames } from "#src/services/genshinParity/fixtures/getFixtureVariantNames";
import { getComponentName } from "@esposter/configuration";
import { getFixtureImageName } from "genshin-interface/getFixtureImageName";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join, sep } from "node:path";

// Every fixture screen under the components folder, and each of its variants, as rows. Read from the files alone, so no
// Component is loaded: a screen's name is its `Index.vue`'s path named the way the components barrel names every
// Component (`getComponentName`). The barrel leaves a lazy or unreferenced directory out, so a screen is named from its
// Path and not read off the barrel, and its variants are its fixture's keys
export const listFixtureScreens = async (
  componentsDirectory: string,
  referenceMap: Record<string, ParityReference>,
  reportMeans: ReadonlyMap<string, number>,
): Promise<FixtureScreenRow[]> => {
  const fixtureFiles = (await readdir(componentsDirectory, { recursive: true })).filter(
    (file) => basename(file) === FIXTURE_FILE_NAME,
  );
  const rows = await Promise.all(
    fixtureFiles.map(async (file) => {
      const directory = dirname(file).replaceAll(sep, "/");
      // A fixture with no component beside it names no screen
      if (!existsSync(join(componentsDirectory, directory, COMPONENT_FILE_NAME))) return [];
      const name = getComponentName(`${directory}/${COMPONENT_FILE_NAME}`);
      const variants = getFixtureVariantNames(await readFile(join(componentsDirectory, file), "utf8"));
      return ["", ...variants].map((variant) =>
        getFixtureScreenRow({
          directory,
          imageExists: existsSync(join(componentsDirectory, directory, `${getFixtureImageName(variant)}.png`)),
          name,
          referenceMap,
          reportMeans,
          variant,
        }),
      );
    }),
  );
  return rows.flat();
};
