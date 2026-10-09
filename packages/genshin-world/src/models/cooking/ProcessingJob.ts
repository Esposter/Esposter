// The units of one processing queued and not yet collected: how many, and the moment the first of them began. Each unit
// Takes its processing's seconds after the one before it, so the units done by a moment are read from that start. A unit
// Done but not yet collected still counts
export interface ProcessingJob {
  count: number;
  startedAt: Temporal.Instant;
}
