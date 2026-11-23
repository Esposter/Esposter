import { FileKey } from "#shared/generated/phaser/FileKey";
import monsterPartyBackground from "#src/assets/dungeons/scene/monsterParty/background.png";
import monsterDetailsBackground from "#src/assets/dungeons/scene/monsterParty/monsterDetailsBackground.png";

export const MonsterPartyAssetMap = {
  [FileKey.SceneMonsterPartyBackground]: monsterPartyBackground,
  [FileKey.SceneMonsterPartyMonsterDetailsBackground]: monsterDetailsBackground,
} as const satisfies Partial<Record<FileKey, string>>;
