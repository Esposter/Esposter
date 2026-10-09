import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { computeAttackShares } from "#src/services/genshinParity/music/computeAttackShares";
import { computeAudibleFrames } from "#src/services/genshinParity/music/computeAudibleFrames";
import { computeBandLevels } from "#src/services/genshinParity/music/computeBandLevels";
import { computeChroma } from "#src/services/genshinParity/music/computeChroma";
import { computeChromaSpectrogram } from "#src/services/genshinParity/music/computeChromaSpectrogram";
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
      const gameSpectrogram = computeChromaSpectrogram(game, LISTEN_SAMPLE_RATE);
      const frames = computeAudibleFrames(computeChroma(gameSpectrogram).loudness);
      const attackSharesList = computeAttackShares(
        computeBandLevels(computeChromaSpectrogram(ours, LISTEN_SAMPLE_RATE), gameSpectrogram, frames),
        frames,
      );
      console.log(`segment ${id}: share of frames that jump, ours against the game's`);
      for (const [band, centre] of LISTEN_BAND_CENTRES.entries()) {
        const attackShares = attackSharesList[band];
        if (!attackShares) continue;
        console.log(`  ${centre} Hz: ${formatShare(attackShares.ours)} against ${formatShare(attackShares.game)}`);
      }
    }
  },
});
