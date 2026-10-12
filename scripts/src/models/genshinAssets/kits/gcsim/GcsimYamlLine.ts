// One line of a gcsim config with its comment cut off: the blank lines above it, its indent, and its text after the indent
export interface GcsimYamlLine {
  blankLines: number;
  indent: number;
  text: string;
}
