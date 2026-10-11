import { relative, sep } from "node:path";

// A register file of a Claude mod, the `register*.ts` under the plugin's `src/services` at any feature's depth. The
// Engine keeps each `$` call and atom in such a file, so a copy between two of them is the engine's shape, not a clone.
const REGISTER_FILE_REGEX = /^src\/services\/(?:[^/]+\/)*register[^/]*\.ts$/u;

export const checkIsRegisterFile = (sourceId: string, pluginRoot: string | undefined): boolean =>
  pluginRoot !== undefined && REGISTER_FILE_REGEX.test(relative(pluginRoot, sourceId).split(sep).join("/"));
