import { FileKey } from "#shared/generated/phaser/FileKey";
import battleForestBackground from "#src/assets/dungeons/scene/battle/forestBackground.png";

export const BattleAssetMap = {
  [FileKey.SceneBattleForestBackground]: battleForestBackground,
} as const satisfies Partial<Record<FileKey, string>>;
