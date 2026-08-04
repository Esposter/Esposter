/**
 * The `stats` block every reporting exit of the workflow returns — one shape whether the run ended at an empty
 * scope or completed. The probe and the two argument guards return before a scope exists, so they carry none.
 */
export interface ReviewStats {
  angles?: number;
  candidates: number;
  claimsChecked?: number;
  claimsInventoried?: number;
  cleanupCap?: number;
  deduped: number;
  droppedUnsettled: number;
  droppedUnverified: number;
  finders: number;
  findMode?: string;
  level: string;
  mode: string;
  perAngle?: number;
  refuted: number;
  reported: number;
  seams?: string[];
  verified: number;
  verifierAgents: number;
}
