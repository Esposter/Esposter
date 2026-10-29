import type { SubCommandsDef } from "citty";

import { COMPONENTS_DIRECTORY } from "#src/services/genshinParity/fixtures/constants";
import { getReportMeans } from "#src/services/genshinParity/fixtures/getReportMeans";
import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { PARITY_SCORES_PATH } from "#src/services/genshinParity/reference/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { defineCommand } from "citty";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

export const fixturesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Every fixture screen and variant as one JSON line: its folder, whether its image is on disk, its reference, that reference's status, last score and bar",
    name: "fixtures",
  },
  run: async () => {
    const report = existsSync(PARITY_SCORES_PATH) ? await readFile(PARITY_SCORES_PATH, "utf8") : "";
    const rows = await listFixtureScreens(COMPONENTS_DIRECTORY, ParityReferenceMap, getReportMeans(report));
    for (const row of rows) console.log(JSON.stringify(row));
  },
});
