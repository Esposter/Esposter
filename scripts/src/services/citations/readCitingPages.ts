import type { CitingPage } from "#src/models/citations/CitingPage";

import { getCitingText } from "#src/services/citations/getCitingText";
import { readCitingPaths } from "#src/services/citations/readCitingPaths";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const readCitingPages = (): CitingPage[] =>
  readCitingPaths().map((path) => ({
    path,
    text: getCitingText(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")),
  }));
