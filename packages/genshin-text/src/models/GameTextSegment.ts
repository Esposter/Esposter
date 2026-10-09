// A run of a game string under one colour: the game colours its numbers and names by a colour tag, which a segment
// Keeps as its CSS colour, or none where the text is plain
export interface GameTextSegment {
  color?: string;
  text: string;
}
