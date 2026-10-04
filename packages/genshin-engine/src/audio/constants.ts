// The live player schedules this far ahead of the audio clock, every so often, so a late timer never leaves a gap
export const MUSIC_LOOKAHEAD_SECONDS = 2;
export const MUSIC_SCHEDULE_INTERVAL_MS = 500;
// A released note is stopped once it has faded for this many of its release's time constants, under a thousandth of
// Its level
export const RELEASE_TIME_CONSTANTS = 7;
// The samples of an instrument's noise looped under each of its notes, a power of two for the transform it is built by
// And about a second and a half at 44.1 kHz, each note starting at its own place in it, and the octave bands its
// Level is given in, from the lowest a mix's rumble reaches to the highest its air does
export const MUSIC_NOISE_LENGTH: number = 2 ** 16;
export const MUSIC_NOISE_BAND_CENTRES: number[] = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
// The MIDI pitch of A4 and its frequency, which every other pitch is tuned from in equal temperament
export const A4_PITCH = 69;
export const A4_FREQUENCY = 440;
