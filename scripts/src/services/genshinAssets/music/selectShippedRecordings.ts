import type { SampleRegion } from "#src/models/genshinAssets/music/SampleRegion";
import type { Instrument, MusicNote } from "genshin-engine";

import { getMusicRecordingRate, RELEASE_TIME_CONSTANTS, selectMusicSample } from "genshin-engine";

// The regions of a recorded instrument a voice's shipped notes play, in the instrument's own order so the sampler picks
// From them as it would from all of them, each with the seconds of its recording the furthest-reaching note reads: to
// The note's end and on through its release until it falls under a thousandth, at the rate the note shifts it by
export const selectShippedRecordings = (
  regions: SampleRegion[],
  notes: MusicNote[],
  { release, tuning }: Pick<Instrument, "release" | "tuning">,
): Map<SampleRegion, number> => {
  const regionSecondsMap = new Map<SampleRegion, number>();
  for (const { duration, pitch, velocity } of notes) {
    const region = selectMusicSample(regions, pitch, velocity);
    if (!region) continue;
    const seconds = (duration + release * RELEASE_TIME_CONSTANTS) * getMusicRecordingRate(region, pitch, tuning);
    regionSecondsMap.set(region, Math.max(regionSecondsMap.get(region) ?? 0, seconds));
  }
  return new Map(
    regions
      .filter((region) => regionSecondsMap.has(region))
      .map((region) => [region, regionSecondsMap.get(region) ?? 0]),
  );
};
