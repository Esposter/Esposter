import { readRowVersionsHeader } from "#shared/services/realtime/readRowVersionsHeader";
import { readActiveRowVersions } from "#src/services/realtime/collectRowVersions";
import { createResponseHeaderLink } from "#src/services/trpc/createResponseHeaderLink";

// Hands a mutation's changed rows, which its answer's response header names, to the mutation that made the call
export const rowVersionsLink = createResponseHeaderLink("mutation", readActiveRowVersions, readRowVersionsHeader);
