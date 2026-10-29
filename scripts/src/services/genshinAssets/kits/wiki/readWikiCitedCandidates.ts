import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/shared/KitOverlay";
import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { readWikiRowValue } from "#src/services/genshinAssets/kits/wiki/readWikiRowValue";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The candidates of the overlay's cited wiki rows: each entry naming a talent page and a row gives its path the field
// Of that row its last key names, read from the page at the revision it was read at, as a hit the wiki's join cannot
// Reach takes its row's poise
export const readWikiCitedCandidates = (
  overlay: KitOverlay,
  pages: readonly WikiTalentPage[],
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  for (const [path, entry] of Object.entries(overlay)) {
    if (!("page" in entry)) continue;
    const field = path.slice(path.lastIndexOf(".") + 1);
    const page = pages.find(({ title }) => title === entry.page);
    if (page === undefined)
      throw new InvalidOperationError(Operation.Read, path, `cites ${entry.page}, which the character has no page of`);
    const row = page.properties.find((property) => property.row === entry.row);
    if (row === undefined)
      throw new InvalidOperationError(
        Operation.Read,
        path,
        `cites row ${entry.row} of ${entry.page}, which the page lacks`,
      );
    const given = readWikiRowValue(row, field);
    if (given === undefined)
      throw new InvalidOperationError(
        Operation.Read,
        path,
        `cites row ${entry.row} of ${entry.page}, which gives no ${field}`,
      );
    addKitCandidate(candidateMap, path, {
      provenance: { page: page.title, revisionId: page.revisionId, row: entry.row, source: KitSource.Wiki },
      value: given.value,
    });
  }
  return candidateMap;
};
