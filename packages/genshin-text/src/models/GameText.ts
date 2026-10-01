import type { GameTextKey } from "#src/models/GameTextKey";

// Every referenced string in one language, as one generated chunk holds it
export type GameText = Record<GameTextKey, string>;
