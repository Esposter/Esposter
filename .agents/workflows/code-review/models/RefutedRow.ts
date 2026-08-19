/** A candidate the run examined and dismissed — the footnote the report format asks for on every run. */
export interface RefutedRow {
  file: string;
  line?: number;
  provenance: string;
  provenanceSource?: string;
  summary: string;
}
