import type { SubCommandsDef } from "citty";
import type { Music } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readLoginMusicSources } from "#src/services/genshinAssets/music/readLoginMusicSources";
import { readSampleCatalogue } from "#src/services/genshinAssets/music/readSampleCatalogue";
import { solveSampledVoices } from "#src/services/genshinAssets/music/solveSampledVoices";
import { SAMPLED_VOICE_REPORTED_COUNT } from "#src/services/genshinAssets/shared/constants";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { formatOnsetAgeSpan } from "#src/services/genshinParity/music/formatOnsetAgeSpan";
import { renderMusicSegments } from "#src/services/genshinParity/music/renderMusicSegments";
import { LISTEN_BAND_CENTRES, LOGIN_MUSIC_SCREEN } from "#src/services/genshinParity/shared/constants";
import { defineCommand } from "citty";

export const instrumentsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Which recorded instruments, one a voice and each keeping its voice's pitch, layered over the synthesizer as it ships bring the game's login music nearest its octave bands without losing pitch agreement, segment by segment: the synthesizer's own score, then the best combinations with their levels and their mix's listening score once its expression is refitted",
    name: "instruments",
  },
  run: async () => {
    const [catalogue, music, renders] = await Promise.all([
      readSampleCatalogue(),
      readWorldData<Music>("login/music.json"),
      renderMusicSegments(DerivedAssetComponent.Login, LOGIN_MUSIC_SCREEN),
    ]);
    for await (const {
      segmentId,
      sourceId,
      splits,
      voiceNotesList,
      voiceReleases,
      voiceTunings,
    } of readLoginMusicSources()) {
      const render = renders.find(({ id }) => id === segmentId);
      if (!render) continue;
      // oxlint-disable-next-line no-await-in-loop -- one source's voices are solved at a time
      const { baseline, solutions } = await solveSampledVoices(
        catalogue,
        voiceNotesList,
        voiceReleases,
        voiceTunings,
        render.game,
        render.ours,
        music.segments[render.index]?.expression ?? [],
      );
      console.log(`segment ${segmentId}, source ${sourceId}: registers split at ${splits.join(", ")}`);
      console.log(
        `  the synthesizer: ${baseline.score.distance.toFixed(2)} dB, pitch agreement ${baseline.score.pitchAgreement.toFixed(3)}`,
      );
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
