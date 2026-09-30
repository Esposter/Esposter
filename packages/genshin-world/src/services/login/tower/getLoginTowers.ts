import type { LoginTower } from "#src/models/login/LoginTower";

import { LoginTowerKind } from "#src/models/login/LoginTowerKind";
import { LOGIN_DOOR_Z } from "#src/services/login/door/constants";
import { LOGIN_DOOR_TOWERS, LOGIN_NEAR_TOWERS, LOGIN_TOWER_FIELD } from "#src/services/login/tower/constants";
import { LoginTowerDiameterMap } from "#src/services/login/tower/LoginTowerDiameterMap";
import { LOGIN_WALKWAY_WIDTH } from "#src/services/login/walkway/constants";
import { createSeededRandom } from "genshin-engine";

const pickKind = (roll: number): LoginTowerKind => {
  let total = 0;
  for (const [kind, weight] of Object.entries(LOGIN_TOWER_FIELD.kindWeights)) {
    total += weight;
    if (roll < total) return kind;
  }
  return LoginTowerKind.Ringed;
};
// Every tower of the login screen: the near ones the title's pose shows, the ones about the door, and the field
// Scattered from the seed either side of the walkway, each clear of the walkway's edge by its own radius and of every
// Tower already standing by the field's spacing, so the same seed stands the same towers every time
export const getLoginTowers = (): LoginTower[] => {
  const {
    count,
    diameterSpread,
    heightRange: [lowestTop, highestTop],
    lateralRange: [nearest, farthest],
    lengthRange: [farEnd, nearEnd],
    seed,
    spacing,
  } = LOGIN_TOWER_FIELD;
  const towers: LoginTower[] = [
    ...LOGIN_NEAR_TOWERS,
    ...LOGIN_DOOR_TOWERS.map(({ position: [x, z], ...tower }): LoginTower => ({
      ...tower,
      position: [x, LOGIN_DOOR_Z + z],
    })),
  ];
  const random = createSeededRandom(seed);
  for (
    let attempt = 0;
    attempt < count * 10 && towers.length < LOGIN_NEAR_TOWERS.length + LOGIN_DOOR_TOWERS.length + count;
    attempt++
  ) {
    const kind = pickKind(random());
    const side = random() < 0.5 ? -1 : 1;
    const x = side * (nearest + random() * (farthest - nearest));
    const z = farEnd + random() * (nearEnd - farEnd);
    const diameter = LoginTowerDiameterMap[kind] * (1 + (random() * 2 - 1) * diameterSpread);
    const top = lowestTop + random() * (highestTop - lowestTop);
    const isClear =
      Math.abs(x) - diameter / 2 > LOGIN_WALKWAY_WIDTH / 2 &&
      towers.every(({ position: [otherX, otherZ] }) => Math.hypot(otherX - x, otherZ - z) > spacing);
    if (isClear) towers.push({ diameter, kind, position: [x, z], top });
  }
  return towers;
};
