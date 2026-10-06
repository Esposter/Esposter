import type { GameSource } from "#src/models/reference/GameSource";
import type { ReferenceTopic } from "#src/models/reference/ReferenceTopic";

// A component's reference, co-located beside it as `Index.reference.ts`: every piece of the game's data it is derived
// From, by a key its derivations cite, and its topics, each a part of the component (its camera, its sky, its door)
// With every investigation run on it and what is still open, kept as `<Topic>.reference.ts` beside the index. It is how
// A derived value is traced back to its source (apps/web/content/docs/genshin/game-data-formats.md)
export interface ComponentReference {
  sources: Record<string, GameSource>;
  topics: Record<string, ReferenceTopic>;
}
