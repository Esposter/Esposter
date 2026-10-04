import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { LISTEN_BAND_CENTRES, LOGIN_MUSIC_SCREEN } from "#src/services/genshinParity/constants";
import { listenToMusic } from "#src/services/genshinParity/listenToMusic";
import { writeParityMusicScores } from "#src/services/genshinParity/writeParityMusicScores";
import { defineCommand } from "citty";

export const listenCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Score the login's music against the game's, segment by segment: pitch agreement, each octave band's distance in decibels, and the distance left once its expression follows the game's and a bus equaliser is fitted over them",
    name: "listen",
  },
  run: async () => {
    const scores = await listenToMusic(DerivedAssetComponent.Login, LOGIN_MUSIC_SCREEN);
    for (const {
      id,
      score,
      shaped: { expression, equalizer, score: shapedScore },
    } of scores) {
      console.log(
        `segment ${id}: pitch agreement ${score.pitchAgreement.toFixed(3)}, distance ${score.distance.toFixed(1)} dB (${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(score.bandDistances[band] ?? 0).toFixed(1)}`).join(", ")})`,
      );
      console.log(
        `  under the game's expression, pitch agreement ${shapedScore.pitchAgreement.toFixed(3)}, distance ${shapedScore.distance.toFixed(1)} dB, held out across bands ${expression.heldOutDistance.toFixed(1)} dB (gains ${expression.windowGains.map((gain) => gain.toFixed(1)).join(", ")})`,
      );
      console.log(
        `  then under a fitted bus equaliser ${equalizer.distance.toFixed(1)} dB, held out across time ${equalizer.heldOutDistance.toFixed(1)} dB (gains ${equalizer.gains.map((gain) => gain.toFixed(1)).join(", ")})`,
      );
    }
    await writeParityMusicScores(LOGIN_MUSIC_SCREEN, scores);
  },
});
