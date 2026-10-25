import { MIDI_MAX_VELOCITY, MIDI_MIN_VELOCITY } from "#src/constants";

// A note's amplitude as its velocity, clamped so a quiet note still sounds and a loud one stays a seven-bit value
export const toVelocity = (amplitude: number): number => {
  const velocity = Math.floor(amplitude * MIDI_MAX_VELOCITY);
  return Math.min(MIDI_MAX_VELOCITY, Math.max(MIDI_MIN_VELOCITY, velocity));
};
