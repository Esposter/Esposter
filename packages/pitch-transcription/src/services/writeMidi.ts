import type { NoteEventTime } from "#src/models/NoteEventTime";

import { CONTOUR_BINS_PER_SEMITONE, MIDI_PITCH_BEND_SEMITONES, MIDI_PITCH_BEND_STEPS } from "#src/constants";
import tonejsMidi from "@tonejs/midi";

// `@tonejs/midi` is a CommonJS bundle whose named exports Node cannot find, so it is read through its default export,
// Which Node and every bundler give as the whole module
const { Midi } = tonejsMidi;

// Notes written as a MIDI file's bytes, one track, each note's amplitude its velocity. A note's bends are spread evenly
// Over it, each its share of a MIDI bend's range: a bend in contour bins is a third of a semitone each, the range two
// Semitones either way, and a bend past it held at its edge. `@tonejs/midi` reads a bend back as that share but writes
// The value it is given as the raw offset from centre, so the share is written in steps
export const writeMidi = (notes: NoteEventTime[]): Uint8Array => {
  const midi = new Midi();
  const track = midi.addTrack();
  for (const { amplitude, durationSeconds, pitchBends = [], pitchMidi, startTimeSeconds } of notes) {
    track.addNote({ duration: durationSeconds, midi: pitchMidi, time: startTimeSeconds, velocity: amplitude });
    for (const [index, bend] of pitchBends.entries()) {
      const share = bend / CONTOUR_BINS_PER_SEMITONE / MIDI_PITCH_BEND_SEMITONES;
      track.addPitchBend({
        time: startTimeSeconds + (index * durationSeconds) / pitchBends.length,
        value: Math.max(
          -MIDI_PITCH_BEND_STEPS,
          Math.min(MIDI_PITCH_BEND_STEPS - 1, Math.round(share * MIDI_PITCH_BEND_STEPS)),
        ),
      });
    }
  }
  return midi.toArray();
};
