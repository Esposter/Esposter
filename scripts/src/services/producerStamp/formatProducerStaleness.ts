import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";

import { MAX_LISTED_PRODUCER_COMMITS, SHORT_SHA_LENGTH } from "#src/services/producerStamp/constants";

// One reader's line about an output's producer, or "" when the output is stamped clean with nothing committed since
export const formatProducerStaleness = (label: string, { commits, stamp }: ProducerStaleness): string => {
  if (!stamp)
    return `${label}: written before outputs recorded their producer, so whether its extractor changed since is unknown`;
  if (!stamp.isDirty && commits.length === 0) return "";
  const source = stamp.isDirty ? ", from uncommitted changes" : "";
  const listed = commits.slice(0, MAX_LISTED_PRODUCER_COMMITS).map((commit) => `  ${commit}`);
  const omitted = commits.length - MAX_LISTED_PRODUCER_COMMITS;
  return [
    `${label}: written at ${stamp.commit.slice(0, SHORT_SHA_LENGTH)}${source}; ${commits.length} commits to its producer since`,
    ...listed,
    ...(omitted > 0 ? [`  …and ${omitted} more`] : []),
  ].join("\n");
};
