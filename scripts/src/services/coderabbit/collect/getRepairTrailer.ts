import { REPAIRS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getBasisText } from "#src/services/coderabbit/collect/getBasisText";

// The trailer the repair commits with: the head it answered, and the collector's own source it was made against. It is
// What proves a session's commit is the repair it was asked for (`repairMain`), so the commit records its basis as every
// Marker does — a commit left by another head's repair, or by an older collector, proves nothing about this one
export const getRepairTrailer = (mainSha: string, collectorSha: string): string =>
  `${REPAIRS_TRAILER}: ${mainSha}${getBasisText([collectorSha])}`;
