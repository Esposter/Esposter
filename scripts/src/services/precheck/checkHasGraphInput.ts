import type { ChangedFile } from "#src/models/queue/ChangedFile";

import { GRAPH_INPUT_REGEX } from "#src/services/precheck/constants";

// A deleted manifest moves the graph as much as an edited one, so a file counts whatever its status
export const checkHasGraphInput = (changedFiles: ChangedFile[]): boolean =>
  changedFiles.some(({ path }) => GRAPH_INPUT_REGEX.test(path));
