// The audio a streamed line emits. Each pass vocodes every speech token made so far, so its waveform repeats what an
// Earlier pass already emitted: the splicer keeps the count emitted, holds back the last samples of each pass as the
// Seam, and fades them into the head of the next pass over the same samples, so only the new audio is emitted and the
// Seam does not click. A pass emits nothing when it adds no audio past the seam; the last pass is the whole waveform.
// The emitted samples end with `bodyLength` samples of the pass's own audio, which is what a speech check reads, since
// The seam carries the audio of the pass before it
// A non-final pass ends its speech at `speechShare` of its waveform, since the decoder pads a pass's tokens with silence
export const createChunkSplicer = (
  overlapSamples: number,
): ((
  waveform: Float32Array,
  isFinal: boolean,
  speechShare: number,
) => { bodyLength: number; samples: Float32Array }) => {
  // The absolute index of the held seam's first sample, which is also the count of samples emitted before it
  let cursor = 0;
  let held = new Float32Array(0);
  return (waveform, isFinal, speechShare) => {
    const hasHeld = held.length > 0;
    if (hasHeld && waveform.length < cursor + overlapSamples) {
      if (!isFinal) return { bodyLength: 0, samples: new Float32Array(0) };

      const remaining = held;
      held = new Float32Array(0);
      return { bodyLength: 0, samples: remaining };
    }

    const end = isFinal ? waveform.length : Math.floor(waveform.length * speechShare) - overlapSamples;
    const bodyStart = hasHeld ? cursor + overlapSamples : cursor;
    if (!isFinal && end <= bodyStart) return { bodyLength: 0, samples: new Float32Array(0) };

    const seam = hasHeld ? crossfade(held, waveform.subarray(cursor, cursor + overlapSamples)) : new Float32Array(0);
    const body = end > bodyStart ? waveform.slice(bodyStart, end) : new Float32Array(0);
    cursor = end;
    held = isFinal ? new Float32Array(0) : waveform.slice(end, end + overlapSamples);
    const samples = new Float32Array(seam.length + body.length);
    samples.set(seam);
    samples.set(body, seam.length);
    return { bodyLength: body.length, samples };
  };
};
// The held samples fade out as the next pass's samples fade in over the same positions
const crossfade = (held: Float32Array, fresh: Float32Array): Float32Array =>
  Float32Array.from(held, (sample, index) => {
    const fadeIn = index / held.length;
    return sample * (1 - fadeIn) + (fresh[index] ?? sample) * fadeIn;
  });
