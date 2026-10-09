// What a build of one package did: its output restored from the cache, or built and stored under its key
export enum BuildCacheOutcome {
  Hit = "cache hit",
  Miss = "cache miss, built",
}
