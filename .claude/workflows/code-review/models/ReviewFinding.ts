/** One reported row of the review. */
export interface ReviewFinding {
  category?: string;
  confidence?: number;
  evidence?: string;
  failure_scenario?: string;
  file: string;
  line?: number;
  provenance: string;
  provenanceSource?: string;
  severity: string;
  shortSummary: string;
  summary: string;
  unresolvedBlocker?: string;
  verdict: string;
}
