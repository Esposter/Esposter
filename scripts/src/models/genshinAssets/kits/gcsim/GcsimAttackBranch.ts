// The branch of an if or else a `Mult` set sits in: the chain the if opens, numbered in its file, the branch's index in
// The chain, `0` for the if and each else after it counting from one, and the line the chain's last branch closes on
export interface GcsimAttackBranch {
  chain: number;
  endLine: number;
  index: number;
}
