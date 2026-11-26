import { IGNORE_PATTERNS } from "@esposter/configuration/oxfmt";

// A generated file vouches for nothing its generator's source does not, and an old one vouches for what that source
// Since dropped — a migration snapshot still spells every column a later migration removed. The paths no formatter
// Rewrites are the repo's one list of what is generated, so the scan skips exactly those, and not the components oxfmt
// Leaves to `vize fmt`. A pattern naming a directory covers the files under it, as the formatter reads it.
export const readGeneratedPatterns = (): string[] => IGNORE_PATTERNS.flatMap((pattern) => [pattern, `${pattern}/**`]);
