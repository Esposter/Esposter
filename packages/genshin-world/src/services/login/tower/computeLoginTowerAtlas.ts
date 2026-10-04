import type { LoginTowerAtlas } from "#src/models/login/LoginTowerAtlas";

import towers from "#src/data/login/towers.json";
import { LOGIN_TOWER_FACADE_GUTTER, LOGIN_TOWER_FACADE_PIXELS_PER_UNIT } from "#src/services/login/tower/constants";

// Where each tower's facade stands in the one canvas every tower reads its surface from: side by side along it, each
// As broad as its surface runs round at its widest and as tall as it stands, at the facade's pixels a unit of its mesh,
// And kept apart from its neighbours by its gutter on either side
export const computeLoginTowerAtlas = (): LoginTowerAtlas => {
  const tiles: LoginTowerAtlas["tiles"] = {};
  let x = 0;
  let height = 0;
  for (const [tower, { size }] of Object.entries(towers.facades)) {
    const [breadth = 0, towerHeight = 0] = size;
    const tile = {
      height: Math.ceil(towerHeight * LOGIN_TOWER_FACADE_PIXELS_PER_UNIT),
      width: Math.ceil(breadth * LOGIN_TOWER_FACADE_PIXELS_PER_UNIT),
      x: x + LOGIN_TOWER_FACADE_GUTTER,
    };
    tiles[tower] = tile;
    x += tile.width + 2 * LOGIN_TOWER_FACADE_GUTTER;
    height = Math.max(height, tile.height);
  }
  return { height, tiles, width: x };
};
