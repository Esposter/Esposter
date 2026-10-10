// What a build of one package did: its dist already matched its key, its output restored from the cache, built and
// Stored, or nothing, for a package with no tsdown configuration, which is a consumer whose dependencies alone are built
export enum BuildCacheOutcome {
  Fresh = "fresh",
  Hit = "cache hit",
  Miss = "cache miss, built",
  NotBuilt = "no build",
}
