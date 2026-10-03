// The live player schedules this far ahead of the audio clock, every so often, so a late timer never leaves a gap
export const MUSIC_LOOKAHEAD_SECONDS = 2;
export const MUSIC_SCHEDULE_INTERVAL_MS = 500;
// A released note is stopped once it has faded for this many of its release's time constants, under a thousandth of
// Its level
export const RELEASE_TIME_CONSTANTS = 7;
// The length of the white noise looped under every note, each note starting at its own place in it
export const MUSIC_NOISE_SECONDS = 1;
// The MIDI pitch of A4 and its frequency, which every other pitch is tuned from in equal temperament
export const A4_PITCH = 69;
export const A4_FREQUENCY = 440;
