import type { MidiEvent } from "#src/models/MidiEvent";
import type { NoteEventTime } from "#src/models/NoteEventTime";

import { CONTOUR_BINS_PER_SEMITONE, MIDI_PITCH_BEND_SEMITONES, MIDI_PITCH_BEND_STEPS } from "#src/constants";
import { toTicks } from "#src/services/writeMidi/toTicks";

// A bend's value is its share of the bend's range, a third of a semitone a contour bin, held within a fourteen-bit range
export const writePitchBendEvents = (notes: NoteEventTime[]): MidiEvent[] =>
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
