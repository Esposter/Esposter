import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";

// The game's tables and the names a strongbox's artifact is taken into the bag with, beside the roll's random
export interface StrongboxCraftTables {
  artifactDropTables: ArtifactDropTables;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  random: () => number;
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}
