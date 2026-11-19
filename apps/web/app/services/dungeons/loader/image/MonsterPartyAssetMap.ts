import { MonsterPartyKey } from "#shared/models/dungeons/keys/image/MonsterPartyKey";
import monsterPartyBackground from "#src/assets/dungeons/scene/monsterParty/background.png";
import monsterDetailsBackground from "#src/assets/dungeons/scene/monsterParty/monsterDetailsBackground.png";

export const MonsterPartyAssetMap = {
  [MonsterPartyKey.MonsterDetailsBackground]: monsterDetailsBackground,
  [MonsterPartyKey.MonsterPartyBackground]: monsterPartyBackground,
} as const satisfies Record<MonsterPartyKey, string>;
