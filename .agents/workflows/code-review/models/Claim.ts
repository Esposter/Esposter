/** One claim of the record a conformance finder checks the code against. */
export interface Claim {
  claim: string;
  pathPrefixes?: string[];
  /** Absent models the orphan a run must drop from the inventory. */
  source?: string;
}
