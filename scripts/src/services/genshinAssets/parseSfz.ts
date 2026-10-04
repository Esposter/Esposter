import type { SampleRegion } from "#src/models/genshinAssets/SampleRegion";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { MIDI_VELOCITY_MAX } from "genshin-engine";
import { posix } from "node:path";

// Each header opens a scope whose opcodes every region under it inherits, a region's own winning over its group's,
// A group's over its master's and so on up
const SCOPES = ["control", "global", "master", "group", "region"];
const COMMENT_REGEX = /\/\*[\s\S]*?\*\/|\/\/.*$/gmu;
// A header, or an opcode's name up to its `=`: a value runs to the next of either, since a sample's path may hold spaces
const TOKEN_REGEX = /<(?<header>\w+)>|(?<opcode>\w+)=/gu;
const NOTE_NAME_REGEX = /^(?<letter>[a-g])(?<accidental>[#b]?)(?<octave>-?\d+)$/iu;
const NOTE_LETTER_SEMITONES: Record<string, number> = { a: 9, b: 11, c: 0, d: 2, e: 4, f: 5, g: 7 };
// A key is a MIDI number or a note name, middle C being `c4`, 60
const parseKey = (value: string): number => {
  const groups = NOTE_NAME_REGEX.exec(value)?.groups;
  const key = groups
    ? 12 * (Number(groups.octave) + 1) +
      (NOTE_LETTER_SEMITONES[groups.letter?.toLowerCase() ?? ""] ?? Number.NaN) +
      (groups.accidental === "#" ? 1 : groups.accidental === "b" ? -1 : 0)
    : Number(value);
  if (!Number.isInteger(key)) throw new InvalidOperationError(Operation.Read, value, "not a key");
  return key;
};
// An SFZ mapping's regions that a note plays: those triggered by its start whose keys hold a note, the first of any
// Round robin, each sample's path joined to `default_path` under the mapping's own folder within its library. A layer
// Crossfaded in or out by velocity answers the velocities where it is the louder of the two it fades between, from the
// Middle of its fade in to the middle of its fade out
export const parseSfz = (text: string, directory: string): SampleRegion[] => {
  const scopes = SCOPES.map(() => new Map<string, string>());
  const regions: SampleRegion[] = [];
  let scopeIndex = 0;
  const flushRegion = () => {
    if (scopeIndex !== SCOPES.length - 1) return;
    const opcodes = new Map(scopes.flatMap((scope) => [...scope]));
    const sample = opcodes.get("sample");
    if (!sample || opcodes.get("trigger")?.startsWith("release") || (opcodes.get("seq_position") ?? "1") !== "1")
      return;
    const readKey = (name: string, fallback: number) => {
      const value = opcodes.get(name) ?? opcodes.get("key");
      return value === undefined ? fallback : parseKey(value);
    };
    const readFadeMiddle = (fade: string, fallback: number) => {
      const low = opcodes.get(`${fade}_lovel`);
      const high = opcodes.get(`${fade}_hivel`);
      return low === undefined || high === undefined ? fallback : Math.floor((Number(low) + Number(high)) / 2);
    };
    const lowKey = readKey("lokey", 0);
    const highKey = readKey("hikey", 127);
    if (lowKey > highKey) return;
    regions.push({
      gain: Number(opcodes.get("volume") ?? 0),
      highKey,
      highVelocity: Math.min(
        Number(opcodes.get("hivel") ?? MIDI_VELOCITY_MAX),
        readFadeMiddle("xfout", MIDI_VELOCITY_MAX),
      ),
      keyCenter: readKey("pitch_keycenter", 60),
      lowKey,
      lowVelocity: Math.max(Number(opcodes.get("lovel") ?? 1), readFadeMiddle("xfin", 0) + 1),
      offset: Number(opcodes.get("offset") ?? 0),
      path: posix.join(directory, `${opcodes.get("default_path") ?? ""}${sample}`.replaceAll("\\", "/")),
      tune: Number(opcodes.get("tune") ?? 0) + 100 * Number(opcodes.get("transpose") ?? 0),
    });
  };

  const source = text.replaceAll(COMMENT_REGEX, "");
  const tokens = [...source.matchAll(TOKEN_REGEX)];
  for (const [index, token] of tokens.entries()) {
    const { header, opcode } = token.groups ?? {};
    if (header) {
      flushRegion();
      const headerIndex = SCOPES.indexOf(header);
      if (headerIndex === -1) {
        scopeIndex = -1;
        continue;
      }
      scopeIndex = headerIndex;
      for (const scope of scopes.slice(headerIndex)) scope.clear();
    } else if (opcode && scopeIndex >= 0) {
      const start = token.index + token[0].length;
      const end = tokens[index + 1]?.index ?? source.length;
      scopes[scopeIndex]?.set(opcode, source.slice(start, end).trim());
    }
  }
  flushRegion();
  return regions;
};
