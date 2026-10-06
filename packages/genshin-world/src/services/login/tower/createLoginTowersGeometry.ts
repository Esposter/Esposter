import type { LoginTowerAtlas } from "#src/models/login/LoginTowerAtlas";
import type { BufferGeometry } from "three";

import towers from "#src/data/login/towers.json";
import { LOGIN_FACADE_ATTRIBUTE, LOGIN_TOWER_RADIAL_SEGMENTS } from "#src/services/login/tower/constants";
import { createLoginTowerColumnGeometry } from "#src/services/login/tower/createLoginTowerColumnGeometry";
import { createLatheStackGeometry, mergeGeometryParts } from "genshin-engine";
import { BufferAttribute, Matrix4, Quaternion, Vector3 } from "three";

// Every tower of the login scene as one geometry: each tower's lathe the fit wrote, built of its sections, with what
// Stands out from its wall built over it as columns of their own (`createLoginTowerColumnGeometry`), scaled,
// Turned and stood where the scene stands each instance of it. Each vertex carries where it reads its tower's facade
// In the atlas: across its tile by how far round the axis it stands, from +z toward +x as the lathe turns, and up it
// By its height from the foot. A lathe's seam vertices stand a hair short of a whole turn, so they read its tile's
// Far edge rather than its near one
export const createLoginTowersGeometry = (atlas: LoginTowerAtlas): BufferGeometry => {
  const matrix = new Matrix4();
  const parts = towers.placements.flatMap(({ position, rotation, scale, tower }) => {
    const facade = towers.facades[tower as keyof typeof towers.facades];
    const tile = atlas.tiles[tower];
    if (!facade || !tile) return [];
    const {
      columns,
      sections,
      size: [breadth = 0],
    } = facade;
    const part = mergeGeometryParts([
      createLatheStackGeometry({ isFaceted: false, radialSegments: LOGIN_TOWER_RADIAL_SEGMENTS, sections }),
      ...columns.map((column) => createLoginTowerColumnGeometry(column, breadth)),
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
    const [x = 0, y = 0, z = 0, w = 1] = rotation;
    return [
      part.applyMatrix4(
        matrix.compose(new Vector3(...position), new Quaternion(x, y, z, w), new Vector3(scale, scale, scale)),
      ),
    ];
  });
  return mergeGeometryParts(parts);
};
