import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GameLanguage, GameText } from "genshin-text";
import type { Ref } from "vue";

// What the session reads from where it starts and never changes: the game's data and words in the reader's language and the
// World's clock, which the session store hands to every feature that needs one of them
export interface WorldSessionContext {
  gameDataBaseUrl: string;
  gameText: GameText;
  getWorldNow: () => Temporal.Instant;
  language: GameLanguage;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  worldNow: Readonly<Ref<Temporal.Instant>>;
}
