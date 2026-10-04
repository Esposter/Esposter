import type { LoginMusicSource } from "#src/models/genshinAssets/music/LoginMusicSource";
import type { ComponentPlaylist } from "#src/models/genshinAssets/shared/ComponentPlaylist";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitMusicVoices } from "#src/services/genshinAssets/shared/fitMusicVoices";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readMusicSourceNotes } from "#src/services/genshinAssets/shared/readMusicSourceNotes";
import { readAudioSamples } from "#src/services/genshinParity/shared/readAudioSamples";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// Each source the login's music plays, segment by segment, as its decoded samples, its voices' notes, and the release
// And tuning each voice's instrument was fitted to (`fitMusicVoices`), yielded one at a time so only one source's
// Samples are held
export const readLoginMusicSources = async function* (): AsyncGenerator<LoginMusicSource> {
  const { music: directory } = getComponentDirectory(DerivedAssetComponent.Login);
  const { segments } = parseMachineJson<ComponentPlaylist>(await readFile(join(directory, "playlist.json"), "utf8"));
  for (const { clips, id } of segments)
    for (const { sourceId } of clips) {
      const wavePath = join(directory, `${sourceId}.wav`);
      // oxlint-disable-next-line no-await-in-loop -- one source's samples are held at a time
      const samples = await readAudioSamples(wavePath, AUDIO_SAMPLE_RATE);
      // oxlint-disable-next-line no-await-in-loop -- as above
      const notes = await readMusicSourceNotes(wavePath, samples);
      const { splits, voiceFits, voiceNotesList } = fitMusicVoices(samples, notes);
      yield {
        samples,
        segmentId: id,
        sourceId,
        splits,
        voiceNotesList,
        voiceReleases: voiceFits.map(({ instrument: { release } }) => release),
        voiceTunings: voiceFits.map(({ instrument: { tuning } }) => tuning),
      };
    }
};
