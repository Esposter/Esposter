import type { SubCommandsDef } from "citty";

import { MINIMUM_PACKAGE_NAME } from "#src/services/genshinAssets/shared/constants";
import { matchGameSounds } from "#src/services/genshinAssets/sound/matchGameSounds";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

// How many of the best scoring sounds are listed
const LISTED_COUNT = 10;

export const soundsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    recording: { description: "A recording of the game that plays the sound", required: true, type: "positional" },
    window: {
      description: "The seconds the sound plays between in the recording, as from,to",
      required: true,
      type: "positional",
    },
    package: {
      default: MINIMUM_PACKAGE_NAME,
      description: "The audio packages to search, a pattern in the game's audio folder",
      type: "string",
    },
    lowest: {
      default: "1000",
      description: "The lowest octave band's centre, in hertz, the match reads, above what the music under it holds",
      type: "string",
    },
  },
  meta: {
    description:
      "Find which of the game's sounds a recording plays in a window, and when: each scored by its octave bands' levels, then the best set of each size the best few make together",
    name: "sounds",
  },
  run: async ({ args }) => {
    const [fromSeconds = 0, toSeconds = 0] = parseNumbers(args.window, "window", 2);
    const { matches, sets } = await matchGameSounds(
      args.recording,
      args.package,
      fromSeconds,
      toSeconds,
      Number(args.lowest),
    );
    for (const { id, score, seconds, startSeconds: matchStartSeconds } of matches.slice(0, LISTED_COUNT))
      console.log(`${id}: ${score.toFixed(3)} from ${matchStartSeconds.toFixed(3)}s, ${seconds.toFixed(2)}s long`);
    for (const { residual, sounds, startSeconds } of sets)
      console.log(
        `${residual.toFixed(2)} dB unexplained from ${startSeconds.toFixed(3)}s: ${sounds.map(({ id, offsetSeconds }) => `${id} at +${offsetSeconds.toFixed(3)}s`).join(", ")}`,
      );
  },
});
