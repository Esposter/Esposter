import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";

// The item that began latest before `now`, its start a wall-clock time in the game's time zone that `getStartsAt` reads off
// It. An item has no recorded end, so a dump read months on keeps its last item rather than none, and undefined only when no
// Item has begun yet
export const findLatestBegun = <TItem>(
  items: TItem[],
  getStartsAt: (item: TItem) => string,
  now: Temporal.Instant,
): TItem | undefined =>
  items
    .map((item) => ({
      begins: Temporal.PlainDateTime.from(getStartsAt(item)).toZonedDateTime(GAME_TIME_ZONE).toInstant(),
      item,
    }))
    .filter(({ begins }) => Temporal.Instant.compare(begins, now) <= 0)
    .toSorted((firstBegun, secondBegun) => Temporal.Instant.compare(secondBegun.begins, firstBegun.begins))
    .at(0)?.item;
