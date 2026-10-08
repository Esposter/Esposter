import { DelegationStep } from "../../models/DelegationStep";

// The lookups in a row after one call: a lookup adds one, a reset clears the run, and a neutral call keeps it
export const getNextStreak = (streak: number, step: DelegationStep): number => {
  if (step === DelegationStep.Lookup) return streak + 1;
  else if (step === DelegationStep.Reset) return 0;
  else return streak;
};
