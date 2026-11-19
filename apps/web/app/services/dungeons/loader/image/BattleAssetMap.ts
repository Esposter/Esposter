import { BattleKey } from "#shared/models/dungeons/keys/image/BattleKey";
import battleForestBackground from "#src/assets/dungeons/scene/battle/forestBackground.png";

export const BattleAssetMap = { [BattleKey.BattleForestBackground]: battleForestBackground } as const satisfies Record<
  BattleKey,
  string
>;
