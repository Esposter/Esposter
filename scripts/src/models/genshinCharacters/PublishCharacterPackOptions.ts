import type { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import type { CharacterPack } from "#src/models/genshinCharacters/CharacterPack";

export interface PublishCharacterPackOptions {
  // Whether to report what would be published without touching an account
  isDryRun: boolean;
  pack: CharacterPack;
  // The accounts the pack's files are stored in, the lock written only when they are every account
  targets: readonly GameDataTarget[];
}
