import type { PropKind } from "#src/models/genshinAssets/props/PropKind";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { propRecordSchema } from "#src/models/genshinAssets/props/PropRecord";
import { GameDataset } from "genshin-world";

// A kind's fitted outline as its builder's record, under the key `props/<name>`. It is parsed before it is returned, so a
// fit carrying anything but the outline's numbers throws here, and nothing is published for the kind
export const buildPropRecord = (kind: PropKind, fitted: unknown): GameDataBuild => ({
  notes: [],
  objects: { [`${GameDataset.Props}/${kind.name}`]: propRecordSchema.parse(fitted) },
});
