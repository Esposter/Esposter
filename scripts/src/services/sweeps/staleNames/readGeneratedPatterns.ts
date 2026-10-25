// oxlint-disable-next-line no-restricted-imports -- the repo-root formatter config, which no `#` map can reach
import formatterConfiguration from "../../../../../oxfmt.config.ts";

// A generated file vouches for nothing its generator's source does not, and an old one vouches for what that source
// Since dropped — a migration snapshot still spells every column a later migration removed. The formatter's ignore
// List is the repo's one list of what is generated, so the scan skips exactly what the formatter skips. A pattern
// Naming a directory covers the files under it, as the formatter reads it.
export const readGeneratedPatterns = (): string[] =>
  (formatterConfiguration.ignorePatterns ?? []).flatMap((pattern) => [pattern, `${pattern}/**`]);
