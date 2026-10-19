// A talent's label as gcsim's generated talent file names it beside a multiplier, `3-Hit DMG: {2}+{2}`: the game's
// Parameters the label reads, in order, each with the file's line citing it. A label written once per row cites its
// Nth parameter on its Nth row, or on its first row where it has fewer rows than parameters
export interface GcsimTalentParameter {
  parameters: { index: number; line: number }[];
}
