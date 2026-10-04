import type { Instrument } from "#src/audio/Instrument";
import type { MusicNote } from "#src/audio/MusicNote";

import { A4_FREQUENCY, A4_PITCH, RELEASE_TIME_CONSTANTS } from "#src/audio/constants";

// One note played at a time on the audio clock: an oscillator over its instrument's waveform at the note's pitch as
// The instrument tunes it, through a gain following the instrument's envelope. The envelope's value at the note's end
// Is worked out rather than held by `cancelAndHoldAtTime`, which Firefox lacks, so the release starts from where the
// Decay had reached
export const scheduleMusicNote = (
  context: BaseAudioContext,
  destination: AudioNode,
  wave: PeriodicWave,
  { attack, decay, level, release, sustain, tuning }: Instrument,
  { duration, pitch, velocity }: MusicNote,
  time: number,
): void => {
  const peak = level * velocity;
  const end = time + duration;
  const oscillator = new OscillatorNode(context, {
    frequency: A4_FREQUENCY * 2 ** ((pitch + tuning - A4_PITCH) / 12),
    periodicWave: wave,
  });
  const gain = new GainNode(context, { gain: 0 });
  gain.gain.setValueAtTime(0, time);
  if (duration <= attack) gain.gain.linearRampToValueAtTime((peak * duration) / attack, end);
  else {
    gain.gain.linearRampToValueAtTime(peak, time + attack);
    gain.gain.setTargetAtTime(peak * sustain, time + attack, decay);
    gain.gain.setValueAtTime(peak * (sustain + (1 - sustain) * Math.exp(-(duration - attack) / decay)), end);
  }
  gain.gain.setTargetAtTime(0, end, release);
  oscillator.connect(gain).connect(destination);
  oscillator.addEventListener("ended", () => {
    gain.disconnect();
  });
  oscillator.start(time);
  oscillator.stop(end + release * RELEASE_TIME_CONSTANTS);
};
