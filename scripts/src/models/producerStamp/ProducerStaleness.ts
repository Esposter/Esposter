import type { ProducerStamp } from "#src/models/producerStamp/ProducerStamp";

// An output's stamp, and each commit to its producer since the stamp's commit, as `<short sha> <subject>`
export interface ProducerStaleness {
  commits: string[];
  stamp?: ProducerStamp;
}
