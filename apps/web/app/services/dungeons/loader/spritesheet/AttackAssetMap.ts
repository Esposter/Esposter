import type { SpritesheetAsset } from "#src/models/dungeons/loader/SpritesheetAsset";

import { AttackKey } from "#shared/models/dungeons/keys/spritesheet/AttackKey";
import iceAttackActive from "#src/assets/dungeons/thirdParty/pimen/iceAttack/active.png";
import iceAttackStart from "#src/assets/dungeons/thirdParty/pimen/iceAttack/start.png";
import slash from "#src/assets/dungeons/thirdParty/pimen/slash.png";

export const AttackAssetMap = {
  [AttackKey.Slash]: { frameHeight: 48, frameWidth: 48, url: slash },
  [AttackKey["Ice Shard"]]: { frameHeight: 32, frameWidth: 32, url: iceAttackActive },
  [AttackKey["Ice Shard Start"]]: { frameHeight: 32, frameWidth: 32, url: iceAttackStart },
} as const satisfies Record<AttackKey, SpritesheetAsset>;
