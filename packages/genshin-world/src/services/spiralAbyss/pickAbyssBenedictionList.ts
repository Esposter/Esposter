import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";

import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/originalResin/constants";

const GAME_EPOCH_DAY = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(GAME_TIME_ZONE).toPlainDate();

// The list of Benedictions a run offers at an instant. PROVISIONAL: the wiki's Spiral Abyss page says a chamber's choice of
// Benedictions refreshes every daily reset and offers one of three, and does not say which list a day draws. So the list is
// The game day's index taken among the chamber's lists in turn, as no source names another rule
export const pickAbyssBenedictionList = (
  lists: readonly (readonly AbyssBenedictionChoice[])[],
  now: Temporal.Instant,
): readonly AbyssBenedictionChoice[] | undefined => {
  const gameDay = now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
  const days = gameDay.since(GAME_EPOCH_DAY).days;
  return lists[((days % lists.length) + lists.length) % lists.length];
};
