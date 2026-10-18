import type { DomainEntrancePlace } from "#src/models/genshinAssets/domains/DomainEntrancePlace";
import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";

import {
  DOMAIN_ENTRANCE_AREA_FIELD,
  DOMAIN_ENTRANCE_POINT,
  DungeonEntryTypeDomainKindMap,
} from "#src/services/genshinAssets/domains/constants";
import { toRegionAxesPlace } from "#src/services/genshinAssets/shared/toRegionAxesPlace";
import { LandmarkKind } from "genshin-world";

// A domain entrance's place in its region's axes round the Windrise origin, as the region's landmarks are: the transport
// Point's place and turn, carried by `toRegionAxesPlace`. Its height is the transport point's own, and its game area is the
// Level-one area the point stands in, 0 where the point holds none. An entry naming no Domain, or whose point is missing or
// Holds no transport position, gives none
export const toDomainEntrance = (
  entry: ExcelDungeonEntryRow,
  point: DumpedScenePoint | undefined,
  origin: readonly [number, number, number],
): DomainEntrancePlace | undefined => {
  const domainKind = DungeonEntryTypeDomainKindMap[entry.type];
  if (domainKind === undefined || point === undefined) return undefined;
  const transport = point[DOMAIN_ENTRANCE_POINT.position];
  if (typeof transport !== "object") return undefined;
  const { x = 0, y = 0, z = 0 } = transport;
  const turn = point[DOMAIN_ENTRANCE_POINT.rotation];
  const { y: turnDegrees = 0 } = typeof turn === "object" ? turn : {};
  const { position, rotation } = toRegionAxesPlace({ x, z }, turnDegrees, origin);
  const area = point[DOMAIN_ENTRANCE_AREA_FIELD];
  return {
    domainKind,
    entryId: entry.id,
    gameAreaId: typeof area === "number" ? area : 0,
    height: y,
    id: `domain-entrance-${entry.id}`,
    kind: LandmarkKind.DomainEntrance,
    position,
    rotation,
  };
};
