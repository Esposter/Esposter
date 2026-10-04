import type { SubCommandsDef } from "citty";

import { SAMPLED_VOICE_REPORTED_COUNT } from "#src/services/genshinAssets/constants";
import { readLoginMusicSources } from "#src/services/genshinAssets/readLoginMusicSources";
import { readSampleCatalogue } from "#src/services/genshinAssets/readSampleCatalogue";
import { solveSampledVoices } from "#src/services/genshinAssets/solveSampledVoices";
import { LISTEN_BAND_CENTRES } from "#src/services/genshinParity/constants";
import { defineCommand } from "citty";

export const instrumentsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Which recorded instruments, one a voice and each keeping its voice's pitch, play the game's login music nearest its octave bands, source by source: the best combinations with their levels and their mix's listening score",
    name: "instruments",
  },
  run: async () => {
    const catalogue = await readSampleCatalogue();
    for await (const {
      samples,
      segmentId,
      sourceId,
      splits,
      voiceNotesList,
      voiceReleases,
      voiceTunings,
    } of readLoginMusicSources()) {
      // oxlint-disable-next-line no-await-in-loop -- one source's voices are solved at a time
      const solutions = await solveSampledVoices(catalogue, voiceNotesList, voiceReleases, voiceTunings, samples);
      console.log(`segment ${segmentId}, source ${sourceId}: registers split at ${splits.join(", ")}`);
      for (const { instruments, levels, score } of solutions.slice(0, SAMPLED_VOICE_REPORTED_COUNT))
        console.log(
          `  ${score.distance.toFixed(2)} dB, pitch agreement ${score.pitchAgreement.toFixed(3)}: ${instruments.map(({ name }, voice) => `${name} at ${(levels[voice] ?? 0).toFixed(3)}`).join(", ")}`,
        );
      const best = solutions[0];
      if (best)
        console.log(
          `  the best's band biases: ${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(best.score.bandBiases[band] ?? 0).toFixed(1)}`).join(", ")}`,
        );
    }
  },
});
