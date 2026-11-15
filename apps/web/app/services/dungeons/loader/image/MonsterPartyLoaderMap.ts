import type { AssetLoader } from "#src/models/dungeons/loader/AssetLoader";

import { MonsterPartyKey } from "#shared/models/dungeons/keys/image/MonsterPartyKey";
import monsterPartyBackground from "#src/assets/dungeons/scene/monsterParty/background.png";
import monsterDetailsBackground from "#src/assets/dungeons/scene/monsterParty/monsterDetailsBackground.png";

export const MonsterPartyLoaderMap = {
  [MonsterPartyKey.MonsterDetailsBackground]: (scene) =>
    scene.load.image(MonsterPartyKey.MonsterDetailsBackground, monsterDetailsBackground),
  [MonsterPartyKey.MonsterPartyBackground]: (scene) =>
    scene.load.image(MonsterPartyKey.MonsterPartyBackground, monsterPartyBackground),
} as const satisfies Record<MonsterPartyKey, AssetLoader>;
