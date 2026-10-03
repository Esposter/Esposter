// What the drain rejected, as the collector posted it: the threads it answered with a reply, and whether the
// Body-only findings were answered by a verdict comment
export interface DrainVerdicts {
  isBodyRejected: boolean;
  rejectedIds: number[];
}
