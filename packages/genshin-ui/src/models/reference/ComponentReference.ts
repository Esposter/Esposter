import type { GameFinding } from "#src/models/reference/GameFinding";
import type { GameSource } from "#src/models/reference/GameSource";

// A component's reference, co-located beside it as `Index.reference.ts`: every piece of the game's data it is derived
// From, by a key its derivations cite, every search run over it with what it found, and what is still open. It is how
// A derived value is traced back to its source (apps/web/content/docs/genshin/game-data-formats.md)
export interface ComponentReference {
  findings: GameFinding[];
  open: string[];
  sources: Record<string, GameSource>;
}
