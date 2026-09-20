import type { PcmClip } from "#src/models/voiceMatch/PcmClip";

// Linear interpolation, which is enough here: every rate this meets is a downsample from 24 or 48 kHz to the
// 16 kHz the models read, and what a speaker encoder and a pitch tracker measure sits well below the aliased band
export const resampleClip = ({ sampleRate, samples }: PcmClip, targetSampleRate: number): PcmClip => {
  if (sampleRate === targetSampleRate) return { sampleRate, samples };

  const ratio = sampleRate / targetSampleRate;
  const resampled = new Float32Array(Math.floor(samples.length / ratio));
  for (const [index] of resampled.entries()) {
    const position = index * ratio;
    const lower = Math.floor(position);
    const fraction = position - lower;
    const start = samples[lower] ?? 0;
    const end = samples[lower + 1] ?? start;
    resampled[index] = start + (end - start) * fraction;
  }

  return { sampleRate: targetSampleRate, samples: resampled };
};
