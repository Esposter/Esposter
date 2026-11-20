import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { readActiveTopicReads } from "#src/services/realtime/collectTopics";
import { createResponseHeaderLink } from "#src/services/trpc/createResponseHeaderLink";

// Hands a query's topics and the time its read began, which its answer's response header names, to the read that made the
// Call. First in the chain, since the read's collector is only set while the call is being made
export const topicsLink = createResponseHeaderLink("query", readActiveTopicReads, readTopicsHeader);
