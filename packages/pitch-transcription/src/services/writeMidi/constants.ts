// A file with no tempo event plays at the MIDI default of 120 beats a minute, so a second is two beats of 480 ticks
export const MIDI_TICKS_PER_BEAT = 480;
export const MIDI_TICKS_PER_SECOND: number = MIDI_TICKS_PER_BEAT * 2;

export const HEADER_CHUNK_TYPE: number[] = [0x4d, 0x54, 0x68, 0x64];
export const TRACK_CHUNK_TYPE: number[] = [0x4d, 0x54, 0x72, 0x6b];
export const EMPTY_TRACK_NAME: number[] = [0xff, 0x03, 0x00];
export const END_OF_TRACK: number[] = [0xff, 0x2f, 0x00];
// Program 0, the acoustic grand piano, on channel 0
export const PIANO_PROGRAM_CHANGE: number[] = [0xc0, 0x00];
