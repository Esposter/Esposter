/** A finder's candidate finding, as the workflow's candidate schema shapes it. */
export interface Candidate {
  failure_scenario?: string;
  file: string;
  kind?: string;
  line?: number;
  summary: string;
}
