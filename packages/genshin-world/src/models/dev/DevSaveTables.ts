import type { AdventureRankLevel } from "#src/models/adventureRank/AdventureRankLevel";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";
import type { GameText } from "genshin-text";

// The records a save command reads the names and the rules of the save from: the names the bag and the screens show, the
// tables an item, a character and a rank are defined from, the catalogue's regions, and the Teleport Waypoints of the map
export interface DevSaveTables {
  adventureRankLevels: AdventureRankLevel[];
  catalogue: Catalogue;
  characterDataMap: ReadonlyMap<number, CharacterData>;
  gameText: GameText;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  waypointLandmarks: WaypointLandmark[];
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}
