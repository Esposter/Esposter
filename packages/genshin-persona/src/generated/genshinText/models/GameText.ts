// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand
import type { GameTextKey } from "#src/generated/genshinText/models/GameTextKey";

// Every referenced string in one language, as one generated chunk holds it
export type GameText = Record<GameTextKey, string>;
