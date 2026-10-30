import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import {
  BARREL_FILE_NAME,
  COMPONENT_FILE_NAME,
  FIXTURE_FILE_NAME,
} from "#src/services/genshinParity/fixtures/constants";
import { getComponentNames } from "#src/services/genshinParity/fixtures/getComponentNames";
import { getFixtureScreenRow } from "#src/services/genshinParity/fixtures/getFixtureScreenRow";
import { getFixtureVariantNames } from "#src/services/genshinParity/fixtures/getFixtureVariantNames";
import { getFixtureImageName } from "genshin-interface/getFixtureImageName";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join, sep } from "node:path";

// Every fixture screen under the components folder, and each of its variants, as rows. Read from the files alone, so no
// Component is loaded: a screen's name is the barrel's export of its `Index.vue`, and its variants are its fixture's keys
export const listFixtureScreens = async (
  componentsDirectory: string,
  referenceMap: Record<string, ParityReference>,
  reportMeans: ReadonlyMap<string, number>,
): Promise<FixtureScreenRow[]> => {
  const componentNames = getComponentNames(await readFile(join(componentsDirectory, BARREL_FILE_NAME), "utf8"));
  const fixtureFiles = (await readdir(componentsDirectory, { recursive: true })).filter(
    (file) => basename(file) === FIXTURE_FILE_NAME,
  );
  const rows = await Promise.all(
    fixtureFiles.map(async (file) => {
      const directory = dirname(file).replaceAll(sep, "/");
      const name = componentNames.get(`${directory}/${COMPONENT_FILE_NAME}`);
      if (name === undefined) return [];
      const variants = getFixtureVariantNames(await readFile(join(componentsDirectory, file), "utf8"));
      return ["", ...variants].map((variant) => {
        return getFixtureScreenRow({
          directory,
          imageExists: existsSync(join(componentsDirectory, directory, `${getFixtureImageName(variant)}.png`)),
          name,
          referenceMap,
          reportMeans,
          variant,
        });
      });
    }),
  );
  return rows.flat();
};
