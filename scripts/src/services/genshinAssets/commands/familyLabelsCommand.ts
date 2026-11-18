import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { buildFamilyLabelEnemyKindIdMap } from "#src/services/genshinAssets/camps/buildFamilyLabelEnemyKindIdMap";
import {
  ENEMY_FAMILY_PAGE_TITLES,
  FAMILY_LABEL_MAP_PATH,
  FAMILY_LABEL_MAP_RELATIVE_PATH,
} from "#src/services/genshinAssets/camps/constants";
import { toFamilyLabelMapSource } from "#src/services/genshinAssets/camps/toFamilyLabelMapSource";
import { fetchEnemyWikiPages } from "#src/services/genshinAssets/enemies/fetchEnemyWikiPages";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { INTERACTIVE_MAP_ENEMY_CATEGORY_ID } from "#src/services/genshinAssets/points/constants";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { readMonsterNames } from "#src/services/genshinAssets/reputation/readMonsterNames";
import { formatText } from "#src/services/shared/formatText";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { writeFileSync } from "node:fs";

export const familyLabelsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Map each enemy family label of the official map to the first variant its wiki family page lists that the world holds a kind for, and write the camps' family-label map from them",
    name: "family-labels",
  },
  run: async ({ args }) => {
    const isDryRun = args["dry-run"];
    const enemyCategory = (await readInteractiveMapLabels()).find(({ id }) => id === INTERACTIVE_MAP_ENEMY_CATEGORY_ID);
    if (!enemyCategory)
      throw new InvalidOperationError(Operation.Read, "the enemy category", "is in no official map label tree");
    console.log(await fetchEnemyWikiPages(ENEMY_FAMILY_PAGE_TITLES, isDryRun));
    const pages = ENEMY_FAMILY_PAGE_TITLES.map((title) => ({ content: readWikiPageContent(title), title }));
    const { matches, unmapped } = buildFamilyLabelEnemyKindIdMap(
      enemyCategory.children.map(({ name }) => name),
      pages,
      readMonsterNames(),
    );
    if (!isDryRun)
      writeFileSync(FAMILY_LABEL_MAP_PATH, formatText(FAMILY_LABEL_MAP_RELATIVE_PATH, toFamilyLabelMapSource(matches)));
    const lines = [
      ...matches.map(({ label, page, variant }) => `${label}: ${variant} (${page})`),
      ...unmapped.map((label) => `${label}: unmapped, no variant of its page is a kind the world holds`),
      `${matches.length} of ${matches.length + unmapped.length} family labels mapped`,
    ];
    console.log((isDryRun ? [...lines, "nothing written"] : lines).join("\n"));
  },
});
