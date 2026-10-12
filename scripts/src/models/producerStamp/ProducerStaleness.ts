import type { ProducerStamp } from "#src/models/producerStamp/ProducerStamp";

// An output's stamp, and each commit to its producer since the stamp's commit, as `<short sha> <subject>`. When the
// Stamp's commit is not an ancestor of HEAD, the commits are the recent window's, which may include older ones
export interface ProducerStaleness {
  commits: string[];
  isApproximate: boolean;
  stamp?: ProducerStamp;
}
