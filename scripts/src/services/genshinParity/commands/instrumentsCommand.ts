import type { ComponentPlaylist } from "#src/models/genshinAssets/ComponentPlaylist";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { SAMPLED_VOICE_REPORTED_COUNT } from "#src/services/genshinAssets/constants";
import { fitMusicVoices } from "#src/services/genshinAssets/fitMusicVoices";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readMusicSourceNotes } from "#src/services/genshinAssets/readMusicSourceNotes";
import { readSampleCatalogue } from "#src/services/genshinAssets/readSampleCatalogue";
import { solveSampledVoices } from "#src/services/genshinAssets/solveSampledVoices";
import { readAudioSamples } from "#src/services/genshinParity/readAudioSamples";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { defineCommand } from "citty";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

export const instrumentsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Which recorded instruments, one a voice, play the game's login music nearest its octave bands, source by source: the best combinations with their levels and the listening score's band distance",
    name: "instruments",
  },
  run: async () => {
    const { music: directory } = getComponentDirectory(DerivedAssetComponent.Login);
    const { segments } = parseMachineJson<ComponentPlaylist>(await readFile(join(directory, "playlist.json"), "utf8"));
    const catalogue = await readSampleCatalogue();
    for (const { id, clips } of segments)
      for (const { sourceId } of clips) {
        const wavePath = join(directory, `${sourceId}.wav`);
        // oxlint-disable-next-line no-await-in-loop -- one source's samples are held at a time
        const samples = await readAudioSamples(wavePath, AUDIO_SAMPLE_RATE);
        // oxlint-disable-next-line no-await-in-loop -- as above
        const notes = await readMusicSourceNotes(wavePath, samples);
        const { splits, voiceFits, voiceNotesList } = fitMusicVoices(samples, notes);
        const releases = voiceFits.map(({ instrument: { release } }) => release);
        const tunings = voiceFits.map(({ instrument: { tuning } }) => tuning);
        // oxlint-disable-next-line no-await-in-loop -- one source's voices are solved at a time
        const solutions = await solveSampledVoices(catalogue, voiceNotesList, releases, tunings, samples);
        console.log(`segment ${id}, source ${sourceId}: registers split at ${splits.join(", ")}`);
        for (const { distance, instruments, levels } of solutions.slice(0, SAMPLED_VOICE_REPORTED_COUNT))
          console.log(
            `  ${distance.toFixed(2)} dB: ${instruments.map(({ name }, voice) => `${name} at ${(levels[voice] ?? 0).toFixed(3)}`).join(", ")}`,
          );
      }
  },
});
