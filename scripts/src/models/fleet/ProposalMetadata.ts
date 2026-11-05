// The fleet's fields on a change's metadata, each empty when the change does not name it:
// The capabilities it needs, the Blocker it waits on, and the paths it touches beyond its Key files table
// The Genshin phase it holds, absent when it names none
export interface ProposalMetadata {
  needs: string[];
  phase?: number;
  touches: string[];
  waiting: string;
}
