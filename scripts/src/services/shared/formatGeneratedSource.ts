// oxlint-disable-next-line no-restricted-imports -- the repo-root formatter config, which no `#` map can reach
import formatterConfiguration from "../../../../oxfmt.config.ts";

// oxlint-disable-next-line no-restricted-imports -- the formatter's own API, which the apps/web phaser generator uses too
import { format } from "oxfmt";

// The text the repository's formatter writes for a generator's output at a path.
// The formatter's command line skips a `generated/` path, so a generator formats through its API.
// That API takes the file name for the parser and no ignore patterns.
// Its output is the canonical form the repository holds its generated files to
export const formatGeneratedSource = async (path: string, source: string): Promise<string> => {
  const { code } = await format(path, source, formatterConfiguration);
  return code;
};
