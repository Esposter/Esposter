import type { LoginTower } from "#src/models/login/LoginTower";

import { LoginTowerKind } from "#src/models/login/LoginTowerKind";

// The towers the title's pose shows near, placed where each one's box stands in the references: each kind's shaft is
// Taken as one width (a crowned 2.2 metres, as the one left of the walkway is where its moulding meets the first wing;
// A ringed 3, as the right one's base ring is at the walkway's level; a slender pole 0.5), which with its width in the
// Frame gives its depth
export const LOGIN_NEAR_TOWERS: LoginTower[] = [
  { diameter: 2.5, kind: LoginTowerKind.Crowned, position: [-4.9, -15.5], top: 9.3 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [-7.1, -35.7], top: 10.1 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [4.8, -38], top: 6.6 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [5.3, -16.8], top: 10.6 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [24.9, -52.2], top: 11.6 },
  { diameter: 2.2, kind: LoginTowerKind.Crowned, position: [14.7, -21.6], top: 6.9 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [26, -47.4], top: 8.7 },
  { diameter: 0.5, kind: LoginTowerKind.Slender, position: [-9.2, -21.6], top: 5.8 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [-27.2, -56.6], top: 8.7 },
  { diameter: 2.2, kind: LoginTowerKind.Crowned, position: [-23.2, -41.5], top: 3.2 },
  { diameter: 0.5, kind: LoginTowerKind.Slender, position: [-11.8, -18.9], top: 3.9 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [-15, -101.8], top: -0.2 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [-9.2, -113.2], top: -5.4 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [6.7, -113.2], top: -1.6 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [15, -101.8], top: -1 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [24, -101.8], top: 0.6 },
];
// The towers standing about the door, as its frame shows them from the flight's last pose, in metres from the door's
// Foot: a crowned tower close on the right, a slender pole just right of the door and a pair of ringed ones behind
export const LOGIN_DOOR_TOWERS: LoginTower[] = [
  { diameter: 3.4, kind: LoginTowerKind.Crowned, position: [9.5, 12], top: 14 },
  { diameter: 0.6, kind: LoginTowerKind.Slender, position: [3.6, -1], top: 11 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [-9, 4], top: 12 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [-14, -14], top: 9 },
  { diameter: 3, kind: LoginTowerKind.Ringed, position: [12, -20], top: 8 },
];
// The rest of the towers, scattered by a seeded stream either side of the walkway down the flight and beyond the
// Door, each kind as often as the references show it and its shaft within a fifth of its kind's width, clear of the
// Walkway and of one another
export const LOGIN_TOWER_FIELD = {
  count: 110,
  diameterSpread: 0.2,
  heightRange: [-6, 8],
  kindWeights: { [LoginTowerKind.Crowned]: 0.2, [LoginTowerKind.Ringed]: 0.55, [LoginTowerKind.Slender]: 0.25 },
  lateralRange: [14, 110],
  lengthRange: [-260, -70],
  seed: 7,
  spacing: 6,
} as const;
