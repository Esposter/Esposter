import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { listenToMusic } from "#src/services/genshinParity/music/listenToMusic";
import { writeParityMusicScores } from "#src/services/genshinParity/music/writeParityMusicScores";
import { LISTEN_BAND_CENTRES, LOGIN_MUSIC_SCREEN } from "#src/services/genshinParity/shared/constants";
import { defineCommand } from "citty";

export const listenCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Score the login's music against the game's, segment by segment: pitch agreement and each octave band's distance in decibels",
    name: "listen",
  },
  run: async () => {
    const scores = await listenToMusic(DerivedAssetComponent.Login, LOGIN_MUSIC_SCREEN);
    for (const { id, score } of scores)
      console.log(
        `segment ${id}: pitch agreement ${score.pitchAgreement.toFixed(3)}, distance ${score.distance.toFixed(1)} dB (${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(score.bandDistances[band] ?? 0).toFixed(1)}`).join(", ")})`,
      );
    await writeParityMusicScores(LOGIN_MUSIC_SCREEN, scores);
  },
});
