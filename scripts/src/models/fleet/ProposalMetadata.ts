// The fleet's fields on a change's metadata, each empty when the change does not name it: the capabilities it needs, the
// Blocker it waits on, and the paths it touches beyond its Key files table
export interface ProposalMetadata {
  needs: string[];
  touches: string[];
  waiting: string;
}
