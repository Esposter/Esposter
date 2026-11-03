import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameLanguage, GameText } from "genshin-text";
import type { Ref } from "vue";

// What the session reads from where it starts and never changes: the game's data and words in the reader's language, the
// Item tables a drop is named and an artifact is rolled from, and the world's clock, which the session store hands to
// Every feature that needs one of them
export interface WorldSessionContext {
  artifactMainAffixPools: readonly ArtifactMainAffixPool[];
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  gameDataBaseUrl: string;
  gameText: GameText;
  getWorldNow: () => Temporal.Instant;
  language: GameLanguage;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  reliquarySets: readonly ReliquarySetData[];
  weaponDataMap: ReadonlyMap<number, WeaponData>;
  worldNow: Readonly<Ref<Temporal.Instant>>;
}
