import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { buildFamilyLabelEnemyKindIdMap } from "#src/services/genshinAssets/camps/buildFamilyLabelEnemyKindIdMap";
import {
  ENEMY_FAMILY_PAGE_TITLES,
  FAMILY_LABEL_MAP_PATH,
  FAMILY_LABEL_MAP_RELATIVE_PATH,
} from "#src/services/genshinAssets/camps/constants";
import { readFamilyLabelRedirects } from "#src/services/genshinAssets/camps/readFamilyLabelRedirects";
import { toEnemyKindIdMember } from "#src/services/genshinAssets/camps/toEnemyKindIdMember";
import { toFamilyLabelMapSource } from "#src/services/genshinAssets/camps/toFamilyLabelMapSource";
import { checkWikiPageCached } from "#src/services/genshinAssets/enemies/checkWikiPageCached";
import { fetchEnemyWikiPages } from "#src/services/genshinAssets/enemies/fetchEnemyWikiPages";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
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
      "Map each enemy family label of the official map to the lowest-id kind the world holds of a family its wiki enemy pages list, through the wiki's redirects, and write the camps' family-label map from them",
    name: "family-labels",
  },
  run: async ({ args }) => {
    const isDryRun = args["dry-run"];
    const enemyCategory = (await readInteractiveMapLabels()).find(({ id }) => id === INTERACTIVE_MAP_ENEMY_CATEGORY_ID);
    if (!enemyCategory)
      throw new InvalidOperationError(Operation.Read, "the enemy category", "is in no official map label tree");
    console.log(await fetchEnemyWikiPages(ENEMY_FAMILY_PAGE_TITLES, isDryRun));
    // A dry run fetches nothing, so with a family page still uncached the map cannot be built and only the listing shows
    const isEveryPageCached = ENEMY_FAMILY_PAGE_TITLES.every((title) =>
      checkWikiPageCached(WIKI_CACHE_DIRECTORY, title),
    );
    if (isDryRun && !isEveryPageCached) {
      console.log("the map is built once every family page is cached\nnothing written");
      return;
    }
    const pages = ENEMY_FAMILY_PAGE_TITLES.map((title) => ({ content: readWikiPageContent(title), title }));
    const labels = enemyCategory.children.map(({ name }) => name);
    const { matches, unmapped } = buildFamilyLabelEnemyKindIdMap(
      labels,
      pages,
      readMonsterNames(),
      await readFamilyLabelRedirects(labels, isDryRun),
    );
    if (!isDryRun)
      writeFileSync(FAMILY_LABEL_MAP_PATH, formatText(FAMILY_LABEL_MAP_RELATIVE_PATH, toFamilyLabelMapSource(matches)));
    const lines = [
      ...matches.map(
        ({ kindId, label, page, variant }) =>
          `${label}: ${toEnemyKindIdMember(kindId)} (listed as ${variant} on ${page})`,
      ),
      ...unmapped.map(({ isListed, label }) =>
        isListed
          ? `${label}: unmapped, no variant of its page is a kind the world holds`
          : `${label}: unmapped, no family page lists it`,
      ),
      `${matches.length} of ${matches.length + unmapped.length} family labels mapped`,
    ];
    console.log((isDryRun ? [...lines, "nothing written"] : lines).join("\n"));
  },
});
