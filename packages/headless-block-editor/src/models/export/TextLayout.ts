// A text laid out for drawing: the baseline of its first line, and each line with the step down from the line above it
export interface TextLayout {
  baselineY: number;
  lines: { dy: number; text: string }[];
}
