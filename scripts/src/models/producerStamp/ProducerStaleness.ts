import type { ProducerVersion } from "#src/models/provenance/Provenance";

// An output's producer version, and each commit to its producer since the stamp's commit, as `<short sha> <subject>`. When
// The stamp's commit is not an ancestor of HEAD, the commits are the recent window's, which may include older ones
export interface ProducerStaleness {
  commits: string[];
  isApproximate: boolean;
  producer?: ProducerVersion;
}
