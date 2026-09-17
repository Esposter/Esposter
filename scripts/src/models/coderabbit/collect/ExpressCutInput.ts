export interface ExpressCutInput {
  cwd: string;
  mainSha: string;
  // The queue commits claiming no review that both branches still owe (`readClaimedShas`), in queue order
  shas: string[];
}
