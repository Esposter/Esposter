import type { SubCommandsDef } from "citty";
import type { Music } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { computeSpectrogram } from "#src/services/genshinAssets/computeSpectrogram";
import { fitVoiceNoises } from "#src/services/genshinAssets/fitVoiceNoises";
import { readWorldData } from "#src/services/genshinAssets/readWorldData";
import {
  CHROMA_FRAME_LENGTH,
  CHROMA_HOP_LENGTH,
  LISTEN_BAND_CENTRES,
  LISTEN_SAMPLE_RATE,
  LOGIN_MUSIC_SCREEN,
} from "#src/services/genshinParity/constants";
import { renderMusicSegments } from "#src/services/genshinParity/renderMusicSegments";
import { defineCommand } from "citty";

// The noise solve run twice over the notes we ship, once on the game's sound and once on our own render of them, beside
// The noise each voice ships with. The game's reading reproduces what ships; ours reproduces it only where the solve
// Reads back what the engine plays, so a band where the two part is the solve or the player misreading the other,
// Whatever `listen` scores there
export const noiseCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Read each voice's noise back from the game's login music and from our own render of it, beside the noise it ships with: where ours parts from what ships, the noise fit and the player disagree",
    name: "noise",
  },
  run: async () => {
    const music = await readWorldData<Music>("login/music.json");
    const renders = await renderMusicSegments(DerivedAssetComponent.Login, LOGIN_MUSIC_SCREEN);
    for (const { game, id, index, ours } of renders) {
      const voices = music.segments[index]?.voices ?? [];
      const voiceNotesList = voices.map(({ notes }) =>
        notes.map(({ duration, pitch, start, velocity }) => ({
          amplitude: velocity,
          durationSeconds: duration,
          pitchMidi: pitch,
          startTimeSeconds: start,
        })),
      );
      const length = Math.min(game.length, ours.length);
      const [gameLevels, ourLevels] = [game, ours].map((samples) => {
        const spectrogram = computeSpectrogram(
          samples.subarray(0, length),
          LISTEN_SAMPLE_RATE,
          CHROMA_FRAME_LENGTH,
          CHROMA_HOP_LENGTH,
        );
        return fitVoiceNoises(spectrogram, voiceNotesList).levels;
      });
      console.log(`segment ${id}: band, shipped, read from the game, read from ours`);
      for (const [voice, { instrument }] of voices.entries())
        console.log(
          `  voice ${voice}: ${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(instrument.noiseBands[band] ?? 0).toFixed(4)} ${(gameLevels?.[voice]?.[band] ?? 0).toFixed(4)} ${(ourLevels?.[voice]?.[band] ?? 0).toFixed(4)}`).join(", ")}`,
        );
    }
  },
});
