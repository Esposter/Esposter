import type { WishScheduleEvent } from "#src/models/genshinAssets/wish/WishScheduleEvent";

import { parseWishPage } from "#src/services/genshinAssets/wish/parseWishPage";
import { readWishItemIdsByName } from "#src/services/genshinAssets/wish/readWishItemIdsByName";
import { readWishPageTitles } from "#src/services/genshinAssets/wish/readWishPageTitles";
import { toWishScheduleEvent } from "#src/services/genshinAssets/wish/toWishScheduleEvent";
import { WISH_PAGE_BATCH_SIZE } from "#src/services/genshinAssets/wish/constants";
import { chunk } from "@esposter/shared";
import { GameDataset } from "genshin-world";
import { readWikiPageText } from "genshin-persona/src/services/readWikiPageText.ts";

// A page's schedule entry, or none when the page is another kind of wish, which the schedule leaves out
const readWishScheduleEvents = async (
  title: string,
  idsByName: ReadonlyMap<string, readonly number[]>,
): Promise<WishScheduleEvent[]> => {
  const page = parseWishPage(await readWikiPageText(title));
  return page === undefined ? [] : [toWishScheduleEvent(title, page, idsByName)];
};

// The event banners of the wiki's wish category, each page read into its kind, its window and its featured items and
// Joined to the ids its names are, as the record the schedule publishes under its own dataset
export const buildWishSchedule = async (): Promise<Record<string, unknown>> => {
  const idsByName = await readWishItemIdsByName();
  const titles = await readWishPageTitles();
  const events = await chunk(titles, WISH_PAGE_BATCH_SIZE).reduce(
    async (previousEvents, batch) => [
      ...(await previousEvents),
      ...(await Promise.all(batch.map((title) => readWishScheduleEvents(title, idsByName)))).flat(),
    ],
    Promise.resolve<WishScheduleEvent[]>([]),
  );
  return { [`${GameDataset.WishSchedule}/eventBanners`]: events };
};
