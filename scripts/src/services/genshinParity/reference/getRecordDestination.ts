import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// Where a record restores: its forward-slash path under the parity folder, joined with the host's own separator
export const getRecordDestination = (recordPath: string): string => join(PARITY_DIRECTORY, ...recordPath.split("/"));
