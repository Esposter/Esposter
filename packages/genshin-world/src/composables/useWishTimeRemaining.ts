import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";
import type { GameText } from "genshin-text";
import type { Ref } from "vue";

import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from "#src/services/time/constants";
import { MILLISECONDS_PER_SECOND } from "@esposter/shared";
import { fillGameTextValues, GameTextKey } from "genshin-text";
import { computed } from "vue";

interface WishTimeRemainingSource {
  // The open banner's id, whose event window is counted down
  bannerId: Ref<string | undefined>;
  // The game's words in the reader's language
  getGameText: () => GameText;
  // The world's clock as the screen shows it, which the window is left by
  getNow: () => Temporal.Instant;
  // The wish schedule's event banners, each with its window
  getWishSchedule: () => WishScheduleEvent[];
}

// The seconds left as the game's three parts, each counted in its unit's words, and the three joined by the game's format,
// "" on a banner with no window and otherwise the open event banner's window left by the screen's clock
export const useWishTimeRemaining = ({ bannerId, getGameText, getNow, getWishSchedule }: WishTimeRemainingSource) =>
  computed(() => {
    const event = getWishSchedule().find(({ id }) => id === bannerId.value);
    if (!event) return "";
    const text = getGameText();
    const seconds = Math.max(0, Math.floor((event.endTime - getNow().epochMilliseconds) / MILLISECONDS_PER_SECOND));
    const days = Math.floor(seconds / SECONDS_PER_DAY);
    const hours = Math.floor((seconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
    const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    return fillGameTextValues(
      text[GameTextKey.WishTimeRemainingFormat],
      fillGameTextValues(text[GameTextKey.WishTimeRemainingDays], days),
      fillGameTextValues(text[GameTextKey.WishTimeRemainingHours], hours),
      fillGameTextValues(text[GameTextKey.WishTimeRemainingMinutes], minutes),
    );
  });
