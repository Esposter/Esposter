import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { LISTEN_BAND_CENTRES, LISTEN_SAMPLE_RATE, LOGIN_MUSIC_SCREEN } from "#src/services/genshinParity/constants";
import { readAudibleFrames } from "#src/services/genshinParity/readAudibleFrames";
import { readBandLevels } from "#src/services/genshinParity/readBandLevels";
import { readFrameSeconds } from "#src/services/genshinParity/readFrameSeconds";
import { readGainsOverTime } from "#src/services/genshinParity/readGainsOverTime";
import { renderMusicSegments } from "#src/services/genshinParity/renderMusicSegments";
import { defineCommand } from "citty";
import { MUSIC_EXPRESSION_WINDOW_SECONDS } from "genshin-engine";

export const balanceCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "The gain each octave band of our login music would need to sound nearest the game's, segment by segment and window by window: whether the game's balance holds through a piece or its arrangement moves under ours",
    name: "balance",
  },
  run: async () => {
    for (const { game, id, ours } of await renderMusicSegments(DerivedAssetComponent.Login, LOGIN_MUSIC_SCREEN)) {
      const frames = readAudibleFrames(computeChroma(game, LISTEN_SAMPLE_RATE).loudness);
      console.log(`segment ${id}: each window's start in seconds, then each band's gain in dB`);
      for (const { gains, start } of readGainsOverTime(
        readBandLevels(ours, game, LISTEN_SAMPLE_RATE, frames),
        frames.map((frame) => readFrameSeconds(frame, LISTEN_SAMPLE_RATE)),
        MUSIC_EXPRESSION_WINDOW_SECONDS,
      ))
        console.log(
          `  ${start} s: ${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(gains[band] ?? 0).toFixed(1)}`).join(", ")}`,
        );
    }
  },
});
