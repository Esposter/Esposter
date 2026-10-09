// What a build of one package did: its dist already matched its key, its output restored from the cache, or built and stored
export enum BuildCacheOutcome {
  Fresh = "fresh",
  Hit = "cache hit",
  Miss = "cache miss, built",
}
