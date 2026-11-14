/* oxlint-disable no-restricted-imports -- the repo-root formatter config, which no `#` map can reach; the formatter's own API, which the apps/web phaser generator uses too */
import formatterConfiguration from "../../../../oxfmt.config.ts";

import { format } from "oxfmt";

// The text the repository's formatter writes for a generator's output at a path.
// The formatter's command line skips a `generated/` path, so a generator formats through its API.
// That API takes the file name for the parser and no ignore patterns.
// Its output is the canonical form a generator writes its files in
export const formatGeneratedSource = async (path: string, source: string): Promise<string> => {
  const { code } = await format(path, source, formatterConfiguration);
  return code;
};
