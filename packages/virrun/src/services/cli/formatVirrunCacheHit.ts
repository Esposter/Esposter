// Task-cache hit line, stderr-only — printed just before the recorded output is replayed so a hit is visibly distinct
// From a real run (the replayed streams are otherwise byte-identical). Brackets inside the banner/result pair like the
// Provisioning line. Accepts the same command shape persistWithCache holds (argv or a pre-joined string).
export const formatVirrunCacheHit = (command: readonly string[] | string): string =>
  `[virrun] cache hit, replaying "${typeof command === "string" ? command : command.join(" ")}"`;
