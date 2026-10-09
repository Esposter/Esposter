// The fleet's frontmatter fields on a proposal page, each empty when the page does not name it: the capabilities a unit
// Needs, the blocker it waits on, and the paths it touches beyond its Key files table
export interface ProposalFrontmatter {
  needs: string[];
  touches: string[];
  waiting: string;
}
