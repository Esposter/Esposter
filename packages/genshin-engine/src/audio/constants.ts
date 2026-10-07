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
// The span in seconds each gain of a segment's expression stands for, given at its window's centre: long enough to
// Hold several phrases' notes and short enough to follow a piece's sections as they swell and fall away
export const MUSIC_EXPRESSION_WINDOW_SECONDS = 8;
// The MIDI pitch of A4 and its frequency, which every other pitch is tuned from in equal temperament
export const A4_PITCH = 69;
export const A4_FREQUENCY = 440;
// The highest velocity MIDI and an SFZ mapping give a note
export const MIDI_VELOCITY_MAX = 127;
// A sound effect's bands, by their edges in hertz: a third of an octave each from 178 Hz to the top of hearing, and
// Below that as wide as two bins or more of `SOUND_EFFECT_FRAME_LENGTH` at 48 kHz, since a narrower band holds no bin of
// Its own, its lowest band from that frame's first bin. The frame is the window a sound effect is read and played in,
// About 43 milliseconds at 48 kHz, and its noise plays in frames a quarter of it apart, where a Hann window's overlaps
// Sum to a constant
export const SOUND_EFFECT_BAND_EDGES: number[] = [
  12, 45, 90, 178, 224, 282, 355, 447, 562, 708, 891, 1122, 1413, 1778, 2239, 2818, 3548, 4467, 5623, 7079, 8913,
  11_220, 14_125, 17_783, 22_387,
];
export const SOUND_EFFECT_FRAME_LENGTH = 2048;
