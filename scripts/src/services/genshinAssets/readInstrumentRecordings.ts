import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";
import type { SampleRegion } from "#src/models/genshinAssets/SampleRegion";
import type { NoteEventTime } from "pitch-transcription/notes";

import { fetchSampleFile } from "#src/services/genshinAssets/fetchSampleFile";
import { readAudioSamples } from "#src/services/genshinParity/readAudioSamples";
import { selectMusicSample } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// The recordings an instrument plays a set of notes from, each decoded once at `AUDIO_SAMPLE_RATE`, by region
export const readInstrumentRecordings = async (
  { library, regions }: CataloguedInstrument,
  notes: NoteEventTime[],
): Promise<Map<SampleRegion, Float32Array>> => {
  const regionSamplesMap = new Map<SampleRegion, Float32Array>();
  for (const { amplitude, pitchMidi } of notes) {
    const region = selectMusicSample(regions, pitchMidi, amplitude);
    if (!region || regionSamplesMap.has(region)) continue;
    // oxlint-disable-next-line no-await-in-loop -- one recording is fetched and decoded at a time
    const samplePath = await fetchSampleFile(library, region.path);
    // A region's offset is where its sound starts, so its recording is read from there
    // oxlint-disable-next-line no-await-in-loop -- as above
    const samples = await readAudioSamples(samplePath, AUDIO_SAMPLE_RATE, region.offset);
    regionSamplesMap.set(region, samples);
  }
  return regionSamplesMap;
};
