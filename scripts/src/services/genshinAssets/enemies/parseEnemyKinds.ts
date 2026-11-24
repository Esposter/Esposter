import type { EnemyKind } from "genshin-world";
import type { Except } from "type-fest";

import { enemyKindSchema, GameDataset } from "genshin-world/definitions";
import { z } from "zod";

// The kinds an enemies build holds before each one's drop source is joined to it, read back through the kind schema the
// World checks them by, without that source
export const parseEnemyKinds = (records: Record<string, unknown>): Except<EnemyKind, "dropSource">[] =>
  z.array(enemyKindSchema.omit({ dropSource: true })).parse(records[`${GameDataset.Enemies}/kinds`]);
