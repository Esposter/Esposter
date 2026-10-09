import { CharacterPackTarget } from "#src/models/genshinCharacters/CharacterPackTarget";
import { GameDataTarget } from "#src/models/gameData/GameDataTarget";

// The accounts each target stores a pack's files in
export const CharacterPackTargetGameDataTargetsMap: Readonly<Record<CharacterPackTarget, readonly GameDataTarget[]>> = {
  [CharacterPackTarget.Both]: [GameDataTarget.Dev, GameDataTarget.Prod],
  [CharacterPackTarget.Dev]: [GameDataTarget.Dev],
  [CharacterPackTarget.Prod]: [GameDataTarget.Prod],
};
