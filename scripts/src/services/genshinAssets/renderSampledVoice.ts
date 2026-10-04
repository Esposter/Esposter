import type { SampleRegion } from "#src/models/genshinAssets/SampleRegion";
import type { NoteEventTime } from "pitch-transcription/notes";

import { RELEASE_TIME_CONSTANTS, selectMusicSample } from "genshin-engine";

// A voice's notes played offline by a sampled instrument as the engine's sampler plays them, into `length` frames at
// The rate its recordings were decoded at: each note its nearest recording, read faster or slower to the note's pitch
// From the recording's own as its mapping's tune and the voice's `tuning` in semitones correct it, by linear
// Interpolation; scaled by the recording's gain and the note's velocity; and once the note ends faded with `release` as
// Its time constant, until it falls under a thousandth
export const renderSampledVoice = (
  notes: NoteEventTime[],
  regions: SampleRegion[],
  regionSamplesMap: Map<SampleRegion, Float32Array>,
  release: number,
  tuning: number,
  sampleRate: number,
  length: number,
): Float32Array => {
  const output = new Float32Array(length);
  for (const { amplitude, durationSeconds, pitchMidi, startTimeSeconds } of notes) {
    const region = selectMusicSample(regions, pitchMidi, amplitude);
    const samples = region && regionSamplesMap.get(region);
    if (!region || !samples) continue;
    const rate = 2 ** ((pitchMidi - region.keyCenter + tuning) / 12 + region.tune / 1200);
    const gain = amplitude * 10 ** (region.gain / 20);
    const startFrame = Math.round(startTimeSeconds * sampleRate);
    const endFrame = startFrame + Math.round(durationSeconds * sampleRate);
    const lastFrame = Math.min(
      endFrame + Math.ceil(release * RELEASE_TIME_CONSTANTS * sampleRate),
      startFrame + Math.floor((samples.length - 1) / rate),
      length - 1,
    );
    for (let frame = startFrame; frame <= lastFrame; frame++) {
      const position = (frame - startFrame) * rate;
      const index = Math.floor(position);
      const fraction = position - index;
      const sample = (samples[index] ?? 0) * (1 - fraction) + (samples[index + 1] ?? 0) * fraction;
      const fade = frame > endFrame ? Math.exp(-(frame - endFrame) / sampleRate / release) : 1;
      output[frame] = (output[frame] ?? 0) + gain * fade * sample;
    }
  }
  return output;
};
