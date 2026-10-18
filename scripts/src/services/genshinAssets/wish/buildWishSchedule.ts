import type { WishScheduleEvent } from "#src/models/genshinAssets/wish/WishScheduleEvent";

import { WISH_PAGE_BATCH_SIZE } from "#src/services/genshinAssets/wish/constants";
import { parseWishPage } from "#src/services/genshinAssets/wish/parseWishPage";
import { readWishNameItemIdsMap } from "#src/services/genshinAssets/wish/readWishNameItemIdsMap";
import { readWishPageTitles } from "#src/services/genshinAssets/wish/readWishPageTitles";
import { toWishScheduleEvent } from "#src/services/genshinAssets/wish/toWishScheduleEvent";
import { chunk } from "@esposter/shared";
import { readWikiPageText } from "genshin-persona/src/services/readWikiPageText.ts";
import { GameDataset } from "genshin-world";

// A page's schedule entry, or none when the page is another kind of wish, which the schedule leaves out
const readWishScheduleEvents = async (
  title: string,
  nameIdsMap: ReadonlyMap<string, readonly number[]>,
): Promise<WishScheduleEvent[]> => {
  const page = parseWishPage(await readWikiPageText(title));
  return page === undefined ? [] : [toWishScheduleEvent(title, page, nameIdsMap)];
};

// The event banners of the wiki's wish category, each page read into its kind, its window and its featured items and
// Joined to the ids its names are, as the record the schedule publishes under its own dataset
export const buildWishSchedule = async (): Promise<Record<string, unknown>> => {
  const nameIdsMap = await readWishNameItemIdsMap();
  const titles = await readWishPageTitles();
  const events = await chunk(titles, WISH_PAGE_BATCH_SIZE).reduce(
    async (previousEvents, batch) => [
      ...(await previousEvents),
      ...(await Promise.all(batch.map((title) => readWishScheduleEvents(title, nameIdsMap)))).flat(),
    ],
    Promise.resolve<WishScheduleEvent[]>([]),
  );
  return { [`${GameDataset.WishSchedule}/eventBanners`]: events };
};
