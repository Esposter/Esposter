import type { SubCommandsDef } from "citty";

import { readLoginMusicSources } from "#src/services/genshinAssets/readLoginMusicSources";
import { readSampleCatalogue } from "#src/services/genshinAssets/readSampleCatalogue";
import { scoreSampledSolos } from "#src/services/genshinAssets/scoreSampledSolos";
import { defineCommand } from "citty";

export const solosCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Every recorded instrument playing each voice of the game's login music alone, source by source: its pitch agreement against the notes' own pitch classes beside pure tones', the lag that agrees best, and its recordings' onset and shift",
    name: "solos",
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
      // oxlint-disable-next-line no-await-in-loop -- one source's voices are scored at a time
      const voiceSolosList = await scoreSampledSolos(
        catalogue,
        voiceNotesList,
        voiceReleases,
        voiceTunings,
        samples.length,
      );
      console.log(`segment ${segmentId}, source ${sourceId}: registers split at ${splits.join(", ")}`);
      for (const [voice, solos] of voiceSolosList.entries()) {
        console.log(`  voice ${voice}, ${voiceNotesList[voice]?.length ?? 0} notes:`);
        for (const { agreement, lag, lagAgreement, name, onset, shift } of solos)
          console.log(
            `    ${agreement.toFixed(3)} (${lagAgreement.toFixed(3)} at lag ${lag}): ${name}, onset ${(onset * 1000).toFixed(0)} ms, shift ${shift.toFixed(1)}`,
          );
      }
    }
  },
});
