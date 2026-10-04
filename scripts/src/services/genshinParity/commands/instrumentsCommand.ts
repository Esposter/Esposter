import type { SubCommandsDef } from "citty";

import { readLoginMusicSources } from "#src/services/genshinAssets/music/readLoginMusicSources";
import { readSampleCatalogue } from "#src/services/genshinAssets/music/readSampleCatalogue";
import { solveSampledVoices } from "#src/services/genshinAssets/music/solveSampledVoices";
import { SAMPLED_VOICE_REPORTED_COUNT } from "#src/services/genshinAssets/shared/constants";
import { formatOnsetAgeSpan } from "#src/services/genshinParity/music/formatOnsetAgeSpan";
import { LISTEN_BAND_CENTRES } from "#src/services/genshinParity/shared/constants";
import { defineCommand } from "citty";

export const instrumentsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Which recorded instruments, one a voice and each keeping its voice's pitch, play the game's login music nearest its octave bands, source by source: the best combinations with their levels and their mix's listening score once its expression follows the game's",
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
      for (const {
        instruments,
        levels,
        shaped: { expression, score },
      } of solutions.slice(0, SAMPLED_VOICE_REPORTED_COUNT))
        console.log(
          `  ${score.distance.toFixed(2)} dB (${expression.heldOutDistance.toFixed(2)} held out across bands), pitch agreement ${score.pitchAgreement.toFixed(3)}: ${instruments.map(({ name }, voice) => `${name} at ${(levels[voice] ?? 0).toFixed(3)}`).join(", ")}`,
        );
      const best = solutions[0];
      if (!best) continue;
      console.log(
        `  the best's band biases: ${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(best.shaped.score.bandBiases[band] ?? 0).toFixed(1)}`).join(", ")}`,
      );
      for (const [span, { bandGaps, share }] of best.onsetAgeGaps.entries())
        console.log(
          `  its gaps ${formatOnsetAgeSpan(span)} after a note began, ${share.toFixed(2)} of frames: ${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(bandGaps[band] ?? 0).toFixed(1)}`).join(", ")}`,
        );
    }
  },
});
