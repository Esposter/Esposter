import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { computeChroma } from "#src/services/genshinParity/music/computeChroma";
import { readAttackShares } from "#src/services/genshinParity/music/readAttackShares";
import { readAudibleFrames } from "#src/services/genshinParity/music/readAudibleFrames";
import { readBandLevels } from "#src/services/genshinParity/music/readBandLevels";
import { renderMusicSegments } from "#src/services/genshinParity/music/renderMusicSegments";
import {
  LISTEN_BAND_CENTRES,
  LISTEN_SAMPLE_RATE,
  LOGIN_MUSIC_SCREEN,
} from "#src/services/genshinParity/shared/constants";
import { defineCommand } from "citty";

const formatShare = (share: number): string => `${(100 * share).toFixed(1)}%`;

export const attacksCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "How often each octave band's level jumps between frames in our login music and in the game's, segment by segment: whether ours strikes notes the game holds",
    name: "attacks",
  },
  run: async () => {
    for (const { game, id, ours } of await renderMusicSegments(DerivedAssetComponent.Login, LOGIN_MUSIC_SCREEN)) {
      const frames = readAudibleFrames(computeChroma(game, LISTEN_SAMPLE_RATE).loudness);
      const attackSharesList = readAttackShares(readBandLevels(ours, game, LISTEN_SAMPLE_RATE, frames), frames);
      console.log(`segment ${id}: share of frames that jump, ours against the game's`);
      for (const [band, centre] of LISTEN_BAND_CENTRES.entries()) {
        const attackShares = attackSharesList[band];
        if (!attackShares) continue;
        console.log(`  ${centre} Hz: ${formatShare(attackShares.ours)} against ${formatShare(attackShares.game)}`);
      }
    }
  },
});
