import { InvalidOperationError, Operation } from "@esposter/shared";

const NOTE_NAME_REGEX = /^(?<letter>[a-g])(?<accidental>[#b]?)(?<octave>-?\d+)$/iu;
const NOTE_LETTER_SEMITONES: Record<string, number> = { a: 9, b: 11, c: 0, d: 2, e: 4, f: 5, g: 7 };

// A key is a MIDI number or a note name, middle C being `c4`, 60
export const parseKey = (value: string): number => {
  const groups = NOTE_NAME_REGEX.exec(value)?.groups;
  const key = groups
    ? 12 * (Number(groups.octave) + 1) +
      (NOTE_LETTER_SEMITONES[groups.letter?.toLowerCase() ?? ""] ?? Number.NaN) +
      (groups.accidental === "#" ? 1 : groups.accidental === "b" ? -1 : 0)
    : Number(value);
  if (!Number.isInteger(key)) throw new InvalidOperationError(Operation.Read, value, "not a key");
  return key;
};
