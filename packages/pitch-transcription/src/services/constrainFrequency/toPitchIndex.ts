import { MIDI_OFFSET } from "#src/constants";

export const toPitchIndex = (frequency: number): number =>
  Math.round(12 * Math.log2(frequency / 440) + 69 - MIDI_OFFSET);
