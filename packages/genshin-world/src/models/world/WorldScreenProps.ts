import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";
import type { QualityTier } from "genshin-engine";
import type { GameLanguage, GameText } from "genshin-text";

// The props the world's screen takes from its host, which it loads the game's names and tables for before it opens
export interface WorldScreenProps {
  // A camera held still, as a reference of the game's sees the world, in place of the one circling the oak
  cameraPose?: WorldCameraPose;
  // Where the host serves the characters' model packs: the index of the ids it holds one for, and under each id that
  // Pack's model, terms and textures. Without it no character is drawn
  characterPackBaseUrl?: string;
  createTerrainWorker: () => Worker;
  // Where the host serves the game's own tables and words, each object fetched by the hash the lock names
  gameDataBaseUrl: string;
  // The game's words in the reader's language
  gameText: GameText;
  // The game's minute of the day the clock is held at, as a reference of the game's shows it
  heldMinutes?: number;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused?: true;
  // Whether the development tuning panel is shown, which the host decides
  isTuning?: true;
  // The reader's game language, whose names the world loads
  language: GameLanguage;
  qualityTier: QualityTier;
  // Where the host serves each region's data, fetched by id as the camera comes within reach
  regionDataBaseUrl: string;
  // The player's save the world's systems start from, a new player's when there is none
  save?: GenshinSave;
  // The server's clock minus this machine's, which every saved timer is read against
  serverClockOffsetMs?: number;
}
