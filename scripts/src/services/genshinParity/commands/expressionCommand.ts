import type { SubCommandsDef } from "citty";
import type { Music } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { roundMusic } from "#src/services/genshinAssets/shared/roundMusic";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { computeAudibleFrames } from "#src/services/genshinParity/music/computeAudibleFrames";
import { computeBandLevels } from "#src/services/genshinParity/music/computeBandLevels";
import { computeChroma } from "#src/services/genshinParity/music/computeChroma";
import { fitMusicExpression } from "#src/services/genshinParity/music/fitMusicExpression";
import { getFrameSeconds } from "#src/services/genshinParity/music/getFrameSeconds";
import { renderMusicSegments } from "#src/services/genshinParity/music/renderMusicSegments";
import { LISTEN_SAMPLE_RATE, LOGIN_MUSIC_SCREEN } from "#src/services/genshinParity/shared/constants";
import { defineCommand } from "citty";
import { MUSIC_EXPRESSION_WINDOW_SECONDS } from "genshin-engine";

export const expressionCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fit each segment of the login's music's expression to the game's swells and fades: our render as it ships, under the expression it already has, refitted window by window and the difference added to it, so a second run moves it little",
    name: "expression",
  },
  run: async () => {
    const music = await readWorldData<Music>("login/music.json");
    for (const { game, id, index, ours } of await renderMusicSegments(
      DerivedAssetComponent.Login,
      LOGIN_MUSIC_SCREEN,
    )) {
      const segment = music.segments[index];
      if (!segment) continue;
      const frames = computeAudibleFrames(computeChroma(game, LISTEN_SAMPLE_RATE).loudness);
      const { distance, heldOutDistance, windowGains } = fitMusicExpression(
        computeBandLevels(ours, game, LISTEN_SAMPLE_RATE, frames),
        frames.map((frame) => getFrameSeconds(frame, LISTEN_SAMPLE_RATE)),
        MUSIC_EXPRESSION_WINDOW_SECONDS,
      );
      // Only the windows whose centre the segment reaches, so its last ramp never runs into the next segment
      const windowCount = Math.ceil(segment.duration / MUSIC_EXPRESSION_WINDOW_SECONDS - 0.5);
      segment.expression = Array.from({ length: windowCount }, (_value, window) =>
        roundMusic((segment.expression[window] ?? 0) + (windowGains[window] ?? windowGains.at(-1) ?? 0)),
      );
      console.log(
        `segment ${id}: ${distance.toFixed(1)} dB under the refitted windows, ${heldOutDistance.toFixed(1)} dB held out across bands; expression ${segment.expression.map((gain) => gain.toFixed(1)).join(", ")}`,
      );
    }
    console.log(await writeWorldData("login/music.json", music));
  },
});
