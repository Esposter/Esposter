import type { EnemyKindId } from "genshin-world";

import { EnemyKindIds } from "genshin-world/definitions";

const WORLD_KIND_IDS: ReadonlySet<number> = new Set(EnemyKindIds);

export const checkWorldKindId = (id: number): id is EnemyKindId => WORLD_KIND_IDS.has(id);
