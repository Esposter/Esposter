import type { GenshinArea } from "#src/models/genshinProgress/GenshinArea";
import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";
import type { GenshinExitReadings } from "#src/models/genshinProgress/GenshinExitReadings";

import { ComputeKind } from "#src/models/fleet/ComputeKind";
import { checkDatasetLockCurrent } from "#src/services/genshinProgress/checkDatasetLockCurrent";
import { checkRegionPassesFrozen } from "#src/services/genshinProgress/checkRegionPassesFrozen";
import { checkScreenIdsUnderBars } from "#src/services/genshinProgress/checkScreenIdsUnderBars";
import { exhaustiveGuard } from "@esposter/shared";

// The exit checks a compute area's kind holds: a screen's ids under their bars, a region's passes frozen and a dataset's
// Lock current. A scene or a set of pieces has none, so it prints no check beside its row
export const getAreaChecks = (area: GenshinArea, exit: GenshinExitReadings): GenshinExitCheck[] => {
  switch (area.kind) {
    case ComputeKind.Dataset:
      return [checkDatasetLockCurrent(area.folder, exit.requiredKeys, exit.lockKeys)];
    case ComputeKind.Pieces:
    case ComputeKind.Scene:
      return [];
    case ComputeKind.Region:
      return [checkRegionPassesFrozen(area.folder, exit.passReports.get(area.folder))];
    case ComputeKind.Screen:
      return [checkScreenIdsUnderBars(area.folder, area.parityIds, exit.means, exit.approvals)];
    default:
      return exhaustiveGuard(area.kind);
  }
};
