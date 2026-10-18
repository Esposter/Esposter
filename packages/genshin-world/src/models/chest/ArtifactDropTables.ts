import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

// The game's tables an artifact a chest drops is rolled from: the main affix pool of each slot, the rarity data of each
// Star count, and the artifact sets the reliquary tables hold, which the drop is drawn among
export interface ArtifactDropTables {
  artifactMainAffixPools: readonly ArtifactMainAffixPool[];
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  reliquarySets: readonly ReliquarySetData[];
}
