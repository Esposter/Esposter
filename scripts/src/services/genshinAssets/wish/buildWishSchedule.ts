import type { WishScheduleEvent } from "#src/models/genshinAssets/wish/WishScheduleEvent";

import { WISH_PAGE_BATCH_SIZE } from "#src/services/genshinAssets/wish/constants";
import { readWishNameItemIdsMap } from "#src/services/genshinAssets/wish/readWishNameItemIdsMap";
import { readWishPageTitles } from "#src/services/genshinAssets/wish/readWishPageTitles";
import { readWishScheduleEvents } from "#src/services/genshinAssets/wish/readWishScheduleEvents";
import { chunk } from "@esposter/shared";
import { GameDataset } from "genshin-world";

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
