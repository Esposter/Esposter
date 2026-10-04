import type { SubCommandsDef } from "citty";
import type { Music } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { computeChroma } from "#src/services/genshinParity/music/computeChroma";
import { formatOnsetAgeSpan } from "#src/services/genshinParity/music/formatOnsetAgeSpan";
import { readAudibleFrames } from "#src/services/genshinParity/music/readAudibleFrames";
import { readBandLevels } from "#src/services/genshinParity/music/readBandLevels";
import { readFrameSeconds } from "#src/services/genshinParity/music/readFrameSeconds";
import { readGapsByOnsetAge } from "#src/services/genshinParity/music/readGapsByOnsetAge";
import { renderMusicSegments } from "#src/services/genshinParity/music/renderMusicSegments";
import {
  LISTEN_BAND_CENTRES,
  LISTEN_SAMPLE_RATE,
  LOGIN_MUSIC_SCREEN,
} from "#src/services/genshinParity/shared/constants";
import { defineCommand } from "citty";

export const decayCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Our login music's gap from the game's in each octave band, segment by segment, by how long since the last note began: whether ours dies sooner than the game's or speaks louder at the attack",
    name: "decay",
  },
  run: async () => {
    const music = await readWorldData<Music>("login/music.json");
    for (const { game, id, index, ours } of await renderMusicSegments(
      DerivedAssetComponent.Login,
      LOGIN_MUSIC_SCREEN,
    )) {
      const frames = readAudibleFrames(computeChroma(game, LISTEN_SAMPLE_RATE).loudness);
      const frameTimes = frames.map((frame) => readFrameSeconds(frame, LISTEN_SAMPLE_RATE));
      const onsets = music.segments[index]?.voices.flatMap(({ notes }) => notes.map(({ start }) => start)) ?? [];
      console.log(`segment ${id}: seconds since the last note began, share of frames, each band's mean gap in dB`);
      for (const [span, { bandGaps, share }] of readGapsByOnsetAge(
        readBandLevels(ours, game, LISTEN_SAMPLE_RATE, frames),
        frameTimes,
        onsets,
      ).entries())
        console.log(
          `  ${formatOnsetAgeSpan(span)}, ${share.toFixed(2)}: ${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(bandGaps[band] ?? 0).toFixed(1)}`).join(", ")}`,
        );
    }
  },
});
