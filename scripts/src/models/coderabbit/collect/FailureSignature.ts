// What a red run failed on, as the repairer counts its attempts: the same jobs of the same workflow are the same red
// Whichever head carries them, so a window merged over it starts no fresh count
export interface FailureSignature {
  // A short digest of `text`, which the attempt markers and the exhausted issue are keyed by (`getMarker`)
  hash: string;
  // The workflow and its failing jobs — or a collector run's failed step and error line — as a person reads them in the
  // Issue
  text: string;
}
