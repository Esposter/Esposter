/**
 * The `stats` block every reporting exit of the workflow returns — one shape whether the run ended at an empty
 * scope or completed. The probe and the two argument guards return before a scope exists, so they carry none.
 */
export interface ReviewStats {
  angles: null | number;
  candidates: number;
  claimsChecked?: number;
  claimsInventoried?: number;
  deduped: number;
  droppedUnsettled: number;
  finders: number;
  findMode: null | string;
  level: string;
  mode: string;
  perAngle: null | number;
  refuted: number;
  reported: number;
  seams?: string[];
  verified: number;
  verifierAgents: number;
}
