import type { WishScheduleEvent } from "#src/models/genshinAssets/wish/WishScheduleEvent";

import { parseWishPage } from "#src/services/genshinAssets/wish/parseWishPage";
import { toWishScheduleEvent } from "#src/services/genshinAssets/wish/toWishScheduleEvent";
import { readWikiPageText } from "genshin-persona/src/services/readWikiPageText.ts";

// A page's schedule entry, or none when the page is another kind of wish, which the schedule leaves out
export const readWishScheduleEvents = async (
  title: string,
  nameIdsMap: ReadonlyMap<string, readonly number[]>,
): Promise<WishScheduleEvent[]> => {
  const page = parseWishPage(title, await readWikiPageText(title));
  return page === undefined ? [] : [toWishScheduleEvent(title, page, nameIdsMap)];
};
