import type { GameTextSegment } from "#src/models/GameTextSegment";

// The game's colour tags, `<color=#RRGGBBAA>` around the words it colours, which CSS reads as they are; a coloured run
// May cross a line, and a tag of any other shape stays plain text
const COLOR_TAG_REGEX = /<color=(?<color>#[\dA-Fa-f]{8})>(?<text>.*?)<\/color>/gsu;

// Splits a game string into its plain and coloured runs, dropping an empty run between two tags
export const splitGameTextColors = (text: string): GameTextSegment[] => {
  const segments: GameTextSegment[] = [];
  let plainStart = 0;
  for (const match of text.matchAll(COLOR_TAG_REGEX)) {
    const { color = "", text: coloredText = "" } = match.groups ?? {};
    segments.push({ text: text.slice(plainStart, match.index) }, { color, text: coloredText });
    plainStart = match.index + match[0].length;
  }
  segments.push({ text: text.slice(plainStart) });
  return segments.filter(({ text: segmentText }) => segmentText !== "");
};
