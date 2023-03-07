import type { Target } from "@/models/clicker/Target";

export interface UnlockCondition {
  target: Target;
  amount: number;
}
