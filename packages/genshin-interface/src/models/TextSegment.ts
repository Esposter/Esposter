// A run of a string drawn in one colour: the colour the game's text tags it with, or none where the screen's own holds
export interface TextSegment {
  color?: string;
  text: string;
}
