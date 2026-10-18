// The branch of an if or else a `Mult` set sits in: the chain the if opens, numbered in its file, the branch's index in
// The chain, `0` for the if and each else after it counting from one, and the line the chain's last branch closes on.
// The chain's arm count is the number of its branches, and it is exhaustive when one of them runs whenever it is reached,
// As a final else or a switch's default does
export interface GcsimAttackBranch {
  armCount: number;
  chain: number;
  endLine: number;
  index: number;
  isExhaustive: boolean;
}
