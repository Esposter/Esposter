import type { LoginTowerAtlas } from "#src/models/login/LoginTowerAtlas";
import type { LoginTowers } from "#src/models/login/LoginTowers";
import type { BufferGeometry } from "three";

import {
  LOGIN_FACADE_ATTRIBUTE,
  LOGIN_FACADE_CUT_ATTRIBUTE,
  LOGIN_TOWER_RADIAL_SEGMENTS,
} from "#src/services/login/tower/constants";
import { createLoginTowerSlabGeometry } from "#src/services/login/tower/createLoginTowerSlabGeometry";
import { createLatheStackGeometry, mergeGeometryParts } from "genshin-engine";
import { BufferAttribute, Matrix4, Quaternion, Vector3 } from "three";

// Only the lathe is cut where the facade opens; a slab stands whole
const withCut = (geometry: BufferGeometry, cut: number): BufferGeometry =>
  geometry.setAttribute(
    LOGIN_FACADE_CUT_ATTRIBUTE,
    new BufferAttribute(new Float32Array(geometry.getAttribute("position").count).fill(cut), 1),
  );
// Every tower of the login scene as one geometry: each tower's lathe the fit wrote, built of its sections, with what
// Stands out from its wall built over it as columns of their own and what sinks deep into it as recesses behind the
// Openings the facade cuts in the lathe (`createLoginTowerSlabGeometry`), built once a tower and copied scaled,
// Turned and stood where the scene stands each instance of it. Each vertex carries where it reads its tower's facade
// In the atlas: across its tile by how far round the axis it stands, from +z toward +x as the lathe turns, and up it
// By its height from the foot. A lathe's seam vertices stand a hair short of a whole turn, so they read its tile's
// Far edge rather than its near one
export const createLoginTowersGeometry = (towers: LoginTowers, atlas: LoginTowerAtlas): BufferGeometry => {
  const matrix = new Matrix4();
  const towerPartMap = new Map<string, BufferGeometry>();
  const createPart = (tower: string): BufferGeometry | undefined => {
    const facade = towers.facades[tower];
    const tile = atlas.tiles[tower];
    if (!facade || !tile) return undefined;
    const {
      columns,
      recesses,
      sections,
      size: [breadth = 0],
    } = facade;
    const part = mergeGeometryParts([
      withCut(createLatheStackGeometry({ isFaceted: false, radialSegments: LOGIN_TOWER_RADIAL_SEGMENTS, sections }), 1),
      ...columns.map((column) => withCut(createLoginTowerSlabGeometry(column, breadth), 0)),
      ...recesses.map((recess) => withCut(createLoginTowerSlabGeometry(recess, breadth, { isSunk: true }), 0)),
    ]);
    const positions = part.getAttribute("position");
    const facadeCoordinates = new Float32Array(positions.count * 2);
    const towerHeight = sections.reduce((sum, { height }) => sum + height, 0);
    for (let index = 0; index < positions.count; index++) {
      const angle = Math.atan2(positions.getX(index), positions.getZ(index));
      const turn = angle / (2 * Math.PI) + (angle < 0 ? 1 : 0);
      facadeCoordinates[index * 2] = (tile.x + turn * tile.width) / atlas.width;
      facadeCoordinates[index * 2 + 1] = (positions.getY(index) / towerHeight) * (tile.height / atlas.height);
    }
    part.setAttribute(LOGIN_FACADE_ATTRIBUTE, new BufferAttribute(facadeCoordinates, 2));
    towerPartMap.set(tower, part);
    return part;
  };
  const parts = towers.placements.flatMap(({ position, rotation, scale, tower }) => {
    const part = towerPartMap.get(tower) ?? createPart(tower);
    if (!part) return [];
    const [x = 0, y = 0, z = 0, w = 1] = rotation;
    return [
      part
        .clone()
        .applyMatrix4(
          matrix.compose(new Vector3(...position), new Quaternion(x, y, z, w), new Vector3(scale, scale, scale)),
        ),
    ];
  });
  const geometry = mergeGeometryParts(parts);
  for (const part of towerPartMap.values()) part.dispose();
  return geometry;
};
