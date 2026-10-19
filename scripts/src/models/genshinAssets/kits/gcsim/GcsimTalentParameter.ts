// One parameter a talent's label reads in gcsim's generated talent file, `3-Hit DMG: {2}+{2}`, with the file's line
// Citing it: a label written once per row cites its Nth parameter on its Nth row, or on its first row where it has
// Fewer rows than parameters
export interface GcsimTalentParameter {
  index: number;
  line: number;
}
