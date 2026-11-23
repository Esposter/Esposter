import type { ESTree } from "@oxlint/plugins";

export interface CaseBlock {
  // The cases that run one body together, in the order the source gives them
  cases: ESTree.SwitchCase[];
  // Whether one of the cases is the default
  isDefaultClause: boolean;
  // What the block sorts by: its first case's name
  name: string;
}
