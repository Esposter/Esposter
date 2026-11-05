import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";
import type { QualityTier } from "genshin-engine";
import type { GameLanguage, GameText } from "genshin-text";

// The props the world's screen takes from its host, which it loads the game's names and tables for before it opens
export interface WorldScreenProps {
  // The signed-in player's avatar and name, which the Paimon menu's profile card shows, given while the player is signed in
  accountAvatarUrl: string;
  accountName: string;
  // A camera held still, as a reference of the game's sees the world, in place of the one circling the oak
  cameraPose?: WorldCameraPose;
  createTerrainWorker: () => Worker;
  // The development registry the host makes in development alone, which the world's commands and variables register with
  devRegistry?: DevRegistry;
  // Where the host serves the game's own tables and words, each object fetched by the hash the lock names
  gameDataBaseUrl: string;
  // The game's words in the reader's language
  gameText: GameText;
  // The game's minute of the day the clock is held at, as a reference of the game's shows it
  heldMinutes?: number;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused: boolean;
  // Whether development offers the free camera in photo mode, which the host decides
  isTuning: boolean;
  // The reader's game language, whose names the world loads
  language: GameLanguage;
  qualityTier: QualityTier;
  // Where the host serves each region's data, fetched by id as the camera comes within reach
  regionDataBaseUrl: string;
  // The player's save the world's systems start from, a new player's when there is none
  save?: GenshinSave;
  // Where the host serves the developer's own exports of the game's scenes: the index of the components it holds, and
  // Under each its witness layout and the meshes and textures the layout names. Without it every scene is drawn from our
  // Own stand-ins alone, as everywhere but the development server
  sceneExportBaseUrl: string;
  // The server's clock minus this machine's, which every saved timer is read against
  serverClockOffsetMs: number;
}
