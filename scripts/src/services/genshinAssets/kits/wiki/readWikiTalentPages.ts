import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { InfoboxTypeCombatTalent } from "#src/models/genshinAssets/kits/wiki/InfoboxTypeCombatTalent";
import { WIKI_API_URL } from "#src/services/genshinAssets/kits/constants";
import { parseAdvancedProperties } from "#src/services/genshinAssets/kits/wiki/parseAdvancedProperties";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { CombatTalent } from "genshin-world";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const INFOBOX_TYPE_REGEX = /\|\s*type\s*=\s*(?<type>[^\n|]+)/u;
const InfoboxTypeCombatTalentMap: Partial<Record<string, CombatTalent>> = {
  [InfoboxTypeCombatTalent.ElementalBurst]: CombatTalent.ElementalBurst,
  [InfoboxTypeCombatTalent.ElementalSkill]: CombatTalent.ElementalSkill,
  [InfoboxTypeCombatTalent.NormalAttack]: CombatTalent.NormalAttack,
};

const categoryResponseSchema = z.object({
  query: z
    .object({
      pages: z.array(
        z.object({
          revisions: z
            .array(
              z.object({ revid: z.int().positive(), slots: z.object({ main: z.object({ content: z.string() }) }) }),
            )
            .default([]),
          title: z.string(),
        }),
      ),
    })
    .optional(),
});

// A character's combat talent pages on the wiki, each at the revision read: its talents category's pages, each kept as
// The MediaWiki API answered for them in one file outside the repository, read again only once that file is deleted.
// A page whose infobox names no combat talent, a passive's, is left out
export const readWikiTalentPages = async (name: string, cacheDirectory: string): Promise<WikiTalentPage[]> => {
  const category = `Category:${name.replaceAll(" ", "_")}_Talents`;
  const cachePath = join(cacheDirectory, `${category.replaceAll(/[^\w-]/gu, "_")}.json`);
  if (!existsSync(cachePath)) {
    const searchParams = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      gcmlimit: "50",
      gcmtitle: category,
      generator: "categorymembers",
      prop: "revisions",
      rvprop: "content|ids",
      rvslots: "main",
    });
    const response = await fetchOk(`${WIKI_API_URL}?${searchParams}`);
    mkdirSync(cacheDirectory, { recursive: true });
    writeFileSync(cachePath, await response.text());
  }
  const { query } = categoryResponseSchema.parse(parseMachineJson(readFileSync(cachePath, "utf8")));
  return (query?.pages ?? []).flatMap(({ revisions: [revision], title }) => {
    if (revision === undefined) return [];
    const wikitext = revision.slots.main.content;
    const type = INFOBOX_TYPE_REGEX.exec(wikitext)?.groups?.type?.trim();
    const combatTalent = type === undefined ? undefined : InfoboxTypeCombatTalentMap[type];
    if (combatTalent === undefined) return [];
    return [{ combatTalent, properties: parseAdvancedProperties(wikitext), revisionId: revision.revid, title }];
  });
};
