// What a cached read depends on, so a write names the fact it changed rather than the caches that hold it.
// A tag is deliberately coarser than an entity: it is the smallest thing a cache can subscribe to without
// Every new cached set having to be enumerated somewhere central
export enum CacheTag {
  // A recorded visit — it reorders Recent without changing which resources exist
  Recents = "Recents",
  // Which resources exist and are live — a create, delete, restore or purge
  Resources = "Resources",
}
