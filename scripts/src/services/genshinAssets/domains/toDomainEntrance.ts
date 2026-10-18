import type { DomainEntrancePlace } from "#src/models/genshinAssets/domains/DomainEntrancePlace";
import type { DumpedEntryPoint } from "#src/models/genshinAssets/domains/DumpedEntryPoint";
import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";

import { DungeonEntryTypeDomainKindMap } from "#src/services/genshinAssets/domains/constants";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { ROTATION_DECIMALS } from "#src/services/genshinAssets/shared/constants";
import { LandmarkKind } from "genshin-world";

// A domain entrance's place in its region's axes round the Windrise origin, as the region's landmarks are: the transport
// Point's x less the origin's, its z mirrored about the origin, and its turn about the vertical in radians, negated as
// The mirror reverses it. An entry naming no domain, or whose point is missing or holds no transport position, gives none
export const toDomainEntrance = (
  entry: ExcelDungeonEntryRow,
  point: DumpedEntryPoint | undefined,
  [originX, , originZ]: readonly [number, number, number],
): DomainEntrancePlace | undefined => {
  const domainKind = DungeonEntryTypeDomainKindMap[entry.type];
  if (domainKind === undefined || point?.tranPos === undefined) return undefined;
  const { x = 0, y = 0, z = 0 } = point.tranPos;
  const { y: turnDegrees = 0 } = point.tranRot ?? {};
  const turn = (turnDegrees * Math.PI) / 180;
  return {
    domainKind,
    entryId: entry.id,
    height: y,
    id: `domain-entrance-${entry.id}`,
    kind: LandmarkKind.DomainEntrance,
    position: { x: roundFitted(x - originX), z: roundFitted(originZ - z) },
    rotation: Math.round(-turn * ROTATION_DECIMALS) / ROTATION_DECIMALS || 0,
  };
};
