import type { WishEventPage } from "#src/models/genshinAssets/wish/WishEventPage";
import type { WishScheduleEvent } from "#src/models/genshinAssets/wish/WishScheduleEvent";

import { joinItemIds } from "#src/services/genshinAssets/wish/joinItemIds";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A banner page's entry in the schedule: its page title as its id, its kind and window, and each featured name joined
// To the ids of the items it names. Every event banner features a five-star, so a page reading none fails the build
// Rather than publishing a banner no wish can feature
export const toWishScheduleEvent = (
  title: string,
  { endTime, fiveStarNames, fourStarNames, kind, kindNumber, startTime }: WishEventPage,
  nameIdsMap: ReadonlyMap<string, readonly number[]>,
): WishScheduleEvent => {
  if (fiveStarNames.length === 0) throw new InvalidOperationError(Operation.Read, title, "features no five-star");

  return {
    endTime,
    fiveStarIds: fiveStarNames.flatMap((name) => joinItemIds(name, nameIdsMap)),
    fourStarIds: fourStarNames.flatMap((name) => joinItemIds(name, nameIdsMap)),
    id: title,
    kind,
    kindNumber,
    startTime,
  };
};
