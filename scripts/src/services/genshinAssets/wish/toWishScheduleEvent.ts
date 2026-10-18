import type { WishEventPage } from "#src/models/genshinAssets/wish/WishEventPage";
import type { WishScheduleEvent } from "#src/models/genshinAssets/wish/WishScheduleEvent";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The ids a featured name joins, every item the names hold under it. A name joining none fails the build rather than
// Dropping the item from its banner
const joinItemIds = (name: string, idsByName: ReadonlyMap<string, readonly number[]>): number[] => {
  const ids = idsByName.get(name) ?? [];
  if (ids.length === 0) throw new InvalidOperationError(Operation.Read, name, "joins no item in the names");

  return [...ids];
};

// A banner page's entry in the schedule: its page title as its id, its kind and window, and each featured name joined to
// The ids of the items it names
export const toWishScheduleEvent = (
  title: string,
  { endTime, fiveStarNames, fourStarNames, kind, startTime }: WishEventPage,
  idsByName: ReadonlyMap<string, readonly number[]>,
): WishScheduleEvent => ({
  endTime,
  fiveStarIds: fiveStarNames.flatMap((name) => joinItemIds(name, idsByName)),
  fourStarIds: fourStarNames.flatMap((name) => joinItemIds(name, idsByName)),
  id: title,
  kind,
  startTime,
});
