import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { Party } from "#src/models/party/Party";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { GameClock, WeatherKind } from "genshin-engine";
import type { Object3D } from "three";

// What the session hands the world's developer commands: the state each one reads or changes, and the registry they join
export interface WorldDevHandleOptions {
  body: Object3D;
  catalogue: Catalogue;
  devRegistry?: DevRegistry;
  getCharacterName: (characterId: number) => string;
  getGameClock: () => GameClock | undefined;
  getLandmarks: () => readonly Landmark[];
  getWeather: () => WeatherKind | undefined;
  jumpTo: (pose: WorldJumpPose) => void;
  party: Party;
}
