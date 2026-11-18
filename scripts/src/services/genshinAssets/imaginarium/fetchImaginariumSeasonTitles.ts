import { WIKI_API_URL } from "#src/services/genshinAssets/kits/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { z } from "zod";

const SEASON_PAGE_PREFIX = "Imaginarium Theater/Seasons/";
const SEASON_PAGE_TITLE_REGEX = /^Imaginarium Theater\/Seasons\/\d{4}-\d{2}-\d{2}$/u;
const allPagesResponseSchema = z.object({ query: z.object({ allpages: z.array(z.object({ title: z.string() })) }) });

// The titles of the wiki's Imaginarium season pages, each named for the day its season begins, from the wiki's own list of
// Pages under the season prefix, so a season the wiki has not written up has no title
export const fetchImaginariumSeasonTitles = async (): Promise<string[]> => {
  const searchParams = new URLSearchParams({
    action: "query",
    aplimit: "500",
    apprefix: SEASON_PAGE_PREFIX,
    format: "json",
    formatversion: "2",
    list: "allpages",
  });
  const text = await (await fetchOk(`${WIKI_API_URL}?${searchParams}`)).text();
  return allPagesResponseSchema
    .parse(parseMachineJson(text))
    .query.allpages.map(({ title }) => title)
    .filter((title) => SEASON_PAGE_TITLE_REGEX.test(title))
    .toSorted();
};
