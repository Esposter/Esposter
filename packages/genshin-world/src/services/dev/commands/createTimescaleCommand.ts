import type { DevCommand } from "#src/models/dev/DevCommand";
import type { GameClock } from "genshin-engine";

import { GAME_MINUTES_PER_SECOND_MAX } from "#src/services/constants";
import { z } from "zod";

// `timescale <minutesPerSecond>` runs the game clock at that many game minutes a real second, zero holding it still
export const createTimescaleCommand = ({
  getGameClock,
}: {
  getGameClock: () => GameClock | undefined;
}): DevCommand<z.ZodObject<{ minutesPerSecond: z.ZodCoercedNumber }>> => ({
  args: z.object({ minutesPerSecond: z.coerce.number().min(0).max(GAME_MINUTES_PER_SECOND_MAX) }),
  name: "timescale",
  run: ({ minutesPerSecond }) => {
    const gameClock = getGameClock();
    if (!gameClock) return { error: "not available here", ok: false };

    gameClock.minutesPerSecond = minutesPerSecond;
    return { ok: true, value: minutesPerSecond };
  },
});
