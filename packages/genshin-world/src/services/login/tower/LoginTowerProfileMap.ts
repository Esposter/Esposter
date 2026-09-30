import type { LoginTowerProfile } from "#src/models/login/LoginTowerProfile";

import { LoginTowerKind } from "#src/models/login/LoginTowerKind";

// Each kind's shape, in shares of its shaft's diameter, measured off the day reference's nearest tower of the kind
// (a crowned tower's tiers and crown off the one left of the walkway, where its shaft is 450 pixels of 4096 wide)
export const LoginTowerProfileMap = {
  [LoginTowerKind.Crowned]: {
    colonnade: { columnCount: 8, columnRadius: 0.045, height: 0.89, ringRadius: 0.4 },
    crownSections: [
      { bottomRadius: 0.49, height: 0.27, topRadius: 0.49 },
      { bottomRadius: 0.59, height: 0.18, topRadius: 0.59 },
    ],
    headSections: [
      { bottomRadius: 0.55, height: 0.16, topRadius: 0.55 },
      { bottomRadius: 0.49, height: 1.09, topRadius: 0.49 },
      { bottomRadius: 0.53, height: 0.13, topRadius: 0.53 },
      { bottomRadius: 0.5, height: 1.11, topRadius: 0.5 },
      { bottomRadius: 0.52, height: 0.36, topRadius: 0.52 },
    ],
    isFaceted: true,
    ring: { interval: 1.1, radius: 0.55, thickness: 0.15 },
  },
  [LoginTowerKind.Ringed]: {
    crownSections: [],
    headSections: [
      { bottomRadius: 0.56, height: 0.1, topRadius: 0.56 },
      { bottomRadius: 0.5, height: 0.3, topRadius: 0.5 },
      { bottomRadius: 0.56, height: 0.15, topRadius: 0.62 },
      { bottomRadius: 0.62, height: 0.08, topRadius: 0.62 },
    ],
    isFaceted: false,
    ring: { interval: 0.75, radius: 0.56, thickness: 0.08 },
  },
  [LoginTowerKind.Slender]: {
    crownSections: [],
    headSections: [
      { bottomRadius: 0.75, height: 0.4, topRadius: 0.75 },
      { bottomRadius: 0.7, height: 0.8, topRadius: 0.2 },
    ],
    isFaceted: false,
    ring: { interval: 4, radius: 0.75, thickness: 0.4 },
  },
} as const satisfies Record<LoginTowerKind, LoginTowerProfile>;
