import type { DevCommand } from "#src/models/dev/DevCommand";
import type { GameClock } from "genshin-engine";

import { DEV_CLOCK_TIME_REGEX } from "#src/services/dev/constants";
import { parseDevClockTime } from "#src/services/dev/parseDevClockTime";
import { z } from "zod";

// `time <HH:MM>` sets the game clock to the hour and minute given, and is not available while the world's clock is unmounted
export const createTimeCommand = ({
  getGameClock,
}: {
  getGameClock: () => GameClock | undefined;
}): DevCommand<z.ZodObject<{ time: z.ZodString }>> => ({
  args: z.object({ time: z.string().regex(DEV_CLOCK_TIME_REGEX, "expected a time as HH:MM") }),
  argumentNames: ["time"],
  name: "time",
  run: ({ time }) => {
    const gameClock = getGameClock();
    if (!gameClock) return { error: "not available here", ok: false };

    gameClock.minutes = parseDevClockTime(time);
    return { ok: true, value: time };
  },
});
