// The loop iteration a per-iteration attack is for: the value its loop's variable takes in the iteration it applies to,
// The variable being the one the `if` around the attack's field set compares
export interface GcsimAttackIteration {
  value: number;
  variable: string;
}
