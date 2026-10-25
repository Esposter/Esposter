import type { GoOpenBody } from "#src/models/genshinAssets/kits/gcsim/GoOpenBody";

// The clauses a switch has opened so far: its chain, how many clauses have started, and the clause the cursor is in
export interface GoSwitchFrame {
  chain: number;
  clause?: GoOpenBody;
  clauseCount: number;
}
