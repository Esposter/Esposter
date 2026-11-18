import type { EnemyTemplateMaterial } from "genshin-world";

import {
  DROPS_DATA_WIKI_TITLE,
  DROPS_MODULE_INVOCATION,
  DROPS_TEMPLATE_WIKI_TITLE,
} from "#src/services/genshinAssets/enemies/constants";
import { parseLuaTable } from "#src/services/genshinAssets/enemies/parseLuaTable";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { toMaterialItemId } from "#src/services/genshinAssets/enemies/toMaterialItemId";
import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The drops module's Enemies table: each entry's members, the names a Drops template gives one of, and its material sets by
// Tier. A set beside a named condition is a conditional set, which a template does not model
const dropsDataSchema = z.object({
  Enemies: z.array(
    z.object({
      MatSet1: z.array(z.string()).optional(),
      MatSet2: z.array(z.string()).optional(),
      members: z.array(z.string()),
      SpecMatSet1: z.unknown().optional(),
    }),
  ),
});

// The materials a Drops template drops, read from the one entry of the drops module that names it, each set's names by
// Tier. The wiki gives a template's materials no count, so none is read
export const buildEnemyDropTemplate = (
  template: string,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
  cacheDirectory: string = WIKI_CACHE_DIRECTORY,
): EnemyTemplateMaterial[] => {
  if (!readWikiPageContent(DROPS_TEMPLATE_WIKI_TITLE, cacheDirectory).includes(DROPS_MODULE_INVOCATION))
    throw new InvalidOperationError(Operation.Read, DROPS_TEMPLATE_WIKI_TITLE, "does not invoke the drops module");
  const { Enemies } = dropsDataSchema.parse(parseLuaTable(readWikiPageContent(DROPS_DATA_WIKI_TITLE, cacheDirectory)));
  const entry = Enemies.find(({ members }) => members.includes(template));
  if (entry === undefined)
    throw new InvalidOperationError(Operation.Read, template, "is in no Enemies entry of the drops module");
  if (entry.SpecMatSet1 !== undefined)
    throw new InvalidOperationError(
      Operation.Read,
      template,
      "has a conditional material set, which no template models",
    );
  return [entry.MatSet1 ?? [], entry.MatSet2 ?? []].flatMap((matSet) =>
    matSet.map((name, tier) => ({ itemId: toMaterialItemId(name, nameItemIdsMap), tier })),
  );
};
