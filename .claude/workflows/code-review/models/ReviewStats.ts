/** The `stats` block every exit of the workflow returns — one shape whether a run ended early or completed. */
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
