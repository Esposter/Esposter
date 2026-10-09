// What a step publishes: each code-named record by its key, and each entity collection by its index key, every entry
// Of which is a record of its own under the entry's id
export interface GameDataPublication {
  indexes: Record<string, Record<string, unknown>>;
  objects: Record<string, unknown>;
}
