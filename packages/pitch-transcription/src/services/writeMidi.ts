import type { NoteEventTime } from "#src/models/NoteEventTime";

import {
  CONTOUR_BINS_PER_SEMITONE,
  MIDI_MAX_VELOCITY,
  MIDI_MIN_VELOCITY,
  MIDI_PITCH_BEND_SEMITONES,
  MIDI_PITCH_BEND_STEPS,
} from "#src/constants";

interface MidiEvent {
  bytes: number[];
  tick: number;
}

// A file with no tempo event plays at the MIDI default of 120 beats a minute, so a second is two beats of 480 ticks
const MIDI_TICKS_PER_BEAT = 480;
const MIDI_TICKS_PER_SECOND = MIDI_TICKS_PER_BEAT * 2;
// A delta time as MIDI writes it, a variable-length quantity: seven bits a byte, most significant byte first, with the
// High bit set on every byte but the last
const writeVariableLength = (value: number) => {
  const bytes = [value & 0x7f];
  for (let rest = value >> 7; rest > 0; rest >>= 7) bytes.unshift((rest & 0x7f) | 0x80);
  return bytes;
};
const toTicks = (seconds: number) => Math.round(seconds * MIDI_TICKS_PER_SECOND);
// A note's amplitude as its velocity, clamped so a quiet note still sounds and a loud one stays a seven-bit value
const toVelocity = (amplitude: number) => {
  const velocity = Math.floor(amplitude * MIDI_MAX_VELOCITY);
  return Math.min(MIDI_MAX_VELOCITY, Math.max(MIDI_MIN_VELOCITY, velocity));
};
const toUint16 = (value: number) => [(value >> 8) & 0xff, value & 0xff];
const toUint32 = (value: number) => [(value >>> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
const writeChunk = (type: number[], data: number[]) => [...type, ...toUint32(data.length), ...data];

const HEADER_CHUNK_TYPE = [0x4d, 0x54, 0x68, 0x64];
const TRACK_CHUNK_TYPE = [0x4d, 0x54, 0x72, 0x6b];
const EMPTY_TRACK_NAME = [0xff, 0x03, 0x00];
const END_OF_TRACK = [0xff, 0x2f, 0x00];
// Program 0, the acoustic grand piano, on channel 0
const PIANO_PROGRAM_CHANGE = [0xc0, 0x00];

// Events are written in tick order, and an event at the same tick as another keeps the place it was given
const writeTrack = (events: MidiEvent[]) => {
  const data: number[] = [];
  let lastTick = 0;
  for (const { bytes, tick } of events.toSorted((firstEvent, secondEvent) => firstEvent.tick - secondEvent.tick)) {
    data.push(...writeVariableLength(tick - lastTick), ...bytes);
    lastTick = tick;
  }
  data.push(0, ...END_OF_TRACK);
  return writeChunk(TRACK_CHUNK_TYPE, data);
};

// A note's off is its start plus its length, each rounded to a tick on its own, so it can sit a tick off their rounded sum
const writeNoteEvents = (notes: NoteEventTime[]): MidiEvent[] =>
  notes
    .map(({ amplitude, durationSeconds, pitchMidi, startTimeSeconds }) => ({
      amplitude,
      offTick: toTicks(startTimeSeconds) + toTicks(durationSeconds),
      onTick: toTicks(startTimeSeconds),
      pitchMidi,
    }))
    .toSorted((firstNote, secondNote) => firstNote.onTick - secondNote.onTick)
    .flatMap(({ amplitude, offTick, onTick, pitchMidi }) => [
      { bytes: [0x90, pitchMidi, toVelocity(amplitude)], tick: onTick },
      { bytes: [0x80, pitchMidi, 0], tick: offTick },
    ]);

// A bend's value is its share of the bend's range, a third of a semitone a contour bin, held within a fourteen-bit range
const writePitchBendEvents = (notes: NoteEventTime[]): MidiEvent[] =>
  notes.flatMap(({ durationSeconds, pitchBends = [], startTimeSeconds }) =>
    pitchBends.map((bend, index) => {
      const share = bend / CONTOUR_BINS_PER_SEMITONE / MIDI_PITCH_BEND_SEMITONES;
      const value =
        MIDI_PITCH_BEND_STEPS +
        Math.max(
          -MIDI_PITCH_BEND_STEPS,
          Math.min(MIDI_PITCH_BEND_STEPS - 1, Math.round(share * MIDI_PITCH_BEND_STEPS)),
        );

      return {
        bytes: [0xe0, value & 0x7f, (value >> 7) & 0x7f],
        tick: toTicks(startTimeSeconds + (index * durationSeconds) / pitchBends.length),
      };
    }),
  );

// Notes written as a format 1 MIDI file's bytes: a tempo track, then one track, each note's amplitude its velocity. A
// Note's bends are spread evenly over it, and a bend past the range is held at its edge
export const writeMidi = (notes: NoteEventTime[]): Uint8Array => {
  const header = writeChunk(HEADER_CHUNK_TYPE, [...toUint16(1), ...toUint16(2), ...toUint16(MIDI_TICKS_PER_BEAT)]);
  const tempoTrack = writeTrack([{ bytes: EMPTY_TRACK_NAME, tick: 0 }]);
  const noteTrack = writeTrack([
    { bytes: EMPTY_TRACK_NAME, tick: 0 },
    { bytes: PIANO_PROGRAM_CHANGE, tick: 0 },
    ...writeNoteEvents(notes),
    ...writePitchBendEvents(notes),
  ]);

  return new Uint8Array([...header, ...tempoTrack, ...noteTrack]);
};
