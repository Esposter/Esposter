// What a builder returns: the notes its step reports, and the records it publishes under their keys. A key it retires
// Leaves the lock with the publish, and its object stays stored until a prune finds no live lock naming it
export interface GameDataBuild {
  notes: string[];
  objects: Record<string, unknown>;
  retired?: string[];
}
