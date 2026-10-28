import type { CataloguedInstrument } from "#src/models/genshinAssets/music/CataloguedInstrument";
import type { SampleRegion } from "#src/models/genshinAssets/music/SampleRegion";
import type { NoteEventTime } from "pitch-transcription/notes";

import { fetchSampleFile } from "#src/services/genshinAssets/music/fetchSampleFile";
import { readAudioSamples } from "#src/services/genshinParity/shared/readAudioSamples";
import { settleAll } from "@esposter/shared";
import { selectMusicSample } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// Recordings fetched from GitHub's raw host at once, as many as the wiki's file reads are
const RECORDING_CONCURRENCY = 8;

// The recordings an instrument plays a set of notes from, each decoded once at `AUDIO_SAMPLE_RATE`, by region
export const readInstrumentRecordings = async (
  { library, regions }: CataloguedInstrument,
  notes: NoteEventTime[],
): Promise<Map<SampleRegion, Float32Array>> => {
  const noteRegions = new Set<SampleRegion>();
  for (const { amplitude, pitchMidi } of notes) {
    const region = selectMusicSample(regions, pitchMidi, amplitude);
    if (region) noteRegions.add(region);
  }
  const recordings = await settleAll(
    Array.from(noteRegions, (region) => async () => {
      const samplePath = await fetchSampleFile(library, region.path);
      // A region's offset is where its sound starts, so its recording is read from there
      return [region, await readAudioSamples(samplePath, AUDIO_SAMPLE_RATE, region.offset)] as const;
    }),
    RECORDING_CONCURRENCY,
  );
  return new Map(recordings);
};
