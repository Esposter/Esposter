// The loop iteration a per-iteration attack is for: the value its loop's variable takes in the iteration it applies to,
// The variable being the one the `if` around a copy's field set compares, or the index a literal's field reads its slice by
export interface GcsimAttackIteration {
  value: number;
  variable: string;
}
