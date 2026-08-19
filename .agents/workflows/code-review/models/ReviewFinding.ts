/** One reported row of the review. */
export interface ReviewFinding {
  alsoAt?: string[];
  confidence?: number;
  corroboration?: number;
  failure_scenario?: string;
  file: string;
  kind?: string;
  line?: number;
  provenance: string;
  provenanceSource?: string;
  severity: string;
  shortSummary: string;
  summary: string;
  unresolvedBlocker?: string;
  verdict: string;
}
