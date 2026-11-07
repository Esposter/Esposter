import type { EnemyKind } from "genshin-world";

import { enemyKindSchema, GameDataset } from "genshin-world";
import { z } from "zod";

// The kinds an enemies build holds, read back through the kind schema the world checks them by
export const parseEnemyKinds = (records: Record<string, unknown>): EnemyKind[] =>
  z.array(enemyKindSchema).parse(records[`${GameDataset.Enemies}/kinds`]);
