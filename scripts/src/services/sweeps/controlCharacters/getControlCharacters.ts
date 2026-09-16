import type { ControlCharacter } from "#src/models/sweeps/controlCharacters/ControlCharacter";

// Tab, newline and carriage return are the three a text file is written with. Every other C0 character, and DEL,
// Renders as nothing — so a reader cannot tell one from an empty string, from its neighbour, or from having been
// Dropped by a tool that rewrote the line, and no diff shows the difference either. The `\uXXXX` escape the
// `typescript` skill requires is six ordinary characters that every tool round-trips.
//
// Matched rather than walked byte by byte: on a tree whose answer is almost always none, the pass that finds
// Nothing is the one worth making fast, and a hand-rolled loop over every byte loses badly to one native scan.
const CONTROL_CHARACTER_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu;

export const getControlCharacters = (text: string): ControlCharacter[] =>
  Array.from(text.matchAll(CONTROL_CHARACTER_REGEX), ({ 0: character, index }) => ({
    codePoint: character.codePointAt(0) ?? 0,
    // Counted only for a finding, which a clean file never has — where carrying the line along the match walk
    // Would pay for it on every character of every file
    line: text.slice(0, index).split("\n").length,
  }));
