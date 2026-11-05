import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { Party } from "#src/models/party/Party";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ScreenKind } from "#src/models/screen/ScreenKind";
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
  getKills: () => ArchiveKills;
  getLandmarks: () => readonly Landmark[];
  getQuestProgressMap: () => ReadonlyMap<string, QuestProgress>;
  getQuests: () => readonly Quest[];
  getScreenKind: () => ScreenKind;
  getWeather: () => undefined | WeatherKind;
  // The window the input reads, which a hold dispatches its keys on
  inputTarget: Pick<Window, "dispatchEvent">;
  jumpTo: (pose: WorldJumpPose) => void;
  party: Party;
}
