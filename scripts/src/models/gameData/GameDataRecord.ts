import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";

// One object as it is stored: the sha256 of its compact JSON, which names it, the dataset key it is stored under, and the
// JSON itself
export interface GameDataRecord extends GameDataObjectRef {
  isIndex: boolean;
  json: string;
}
