import type { SubCommandsDef } from "citty";

import { SAMPLED_VOICE_REPORTED_COUNT } from "#src/services/genshinAssets/constants";
import { readLoginMusicSources } from "#src/services/genshinAssets/readLoginMusicSources";
import { readSampleCatalogue } from "#src/services/genshinAssets/readSampleCatalogue";
import { solveSampledVoices } from "#src/services/genshinAssets/solveSampledVoices";
import { LISTEN_BAND_CENTRES } from "#src/services/genshinParity/constants";
import { formatOnsetAgeSpan } from "#src/services/genshinParity/formatOnsetAgeSpan";
import { defineCommand } from "citty";

export const instrumentsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Which recorded instruments, one a voice and each keeping its voice's pitch, play the game's login music nearest its octave bands, source by source: the best combinations once their expression follows the game's and a bus equaliser is fitted over them, with their levels and their mix's listening scores",
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
        score,
        shaped: { expression, equalizer, score: shapedScore },
      } of solutions.slice(0, SAMPLED_VOICE_REPORTED_COUNT))
        console.log(
          `  ${score.distance.toFixed(2)} dB and ${score.pitchAgreement.toFixed(3)} as mixed; under the game's expression ${shapedScore.distance.toFixed(2)} dB (${expression.heldOutDistance.toFixed(2)} held out across bands) and ${shapedScore.pitchAgreement.toFixed(3)}; equalized ${equalizer.distance.toFixed(2)} dB (${equalizer.heldOutDistance.toFixed(2)} held out across time): ${instruments.map(({ name }, voice) => `${name} at ${(levels[voice] ?? 0).toFixed(3)}`).join(", ")}`,
        );
      const best = solutions[0];
      if (!best) continue;
      console.log(
        `  the best's band biases as mixed, and its equaliser's gains: ${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(best.score.bandBiases[band] ?? 0).toFixed(1)} ${(best.shaped.equalizer.gains[band] ?? 0).toFixed(1)}`).join(", ")}`,
      );
      for (const [span, { bandGaps, share }] of best.onsetAgeGaps.entries())
        console.log(
          `  its gaps ${formatOnsetAgeSpan(span)} after a note began, ${share.toFixed(2)} of frames: ${LISTEN_BAND_CENTRES.map((centre, band) => `${centre} Hz ${(bandGaps[band] ?? 0).toFixed(1)}`).join(", ")}`,
        );
    }
  },
});
