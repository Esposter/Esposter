import { A4_FREQUENCY, A4_PITCH } from "genshin-engine";

// A pitch's frequency in equal temperament, a fractional pitch reading between its semitones
export const toFrequency = (pitch: number): number => A4_FREQUENCY * 2 ** ((pitch - A4_PITCH) / 12);
