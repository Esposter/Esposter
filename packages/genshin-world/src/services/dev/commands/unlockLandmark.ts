import type { DevSaveOutcome } from "#src/models/dev/DevSaveOutcome";
import type { DevSaveTables } from "#src/models/dev/DevSaveTables";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { DevUnlockKind } from "#src/models/dev/DevUnlockKind";
import { resolveDevName } from "#src/services/dev/resolveDevName";
import { RegionIdStatueLandmarkIdMap } from "#src/services/statue/RegionIdStatueLandmarkIdMap";
import { createAreaNameMap } from "#src/services/world/createAreaNameMap";
import { z } from "zod";

// The `unlock` line: a region or a waypoint, and the name the game shows it under
export const unlockLandmarkArgumentsSchema = z.object({ kind: z.enum(DevUnlockKind), name: z.string().min(1) });

export type UnlockLandmarkArguments = z.infer<typeof unlockLandmarkArgumentsSchema>;

// Unlocks a region's Statue of The Seven or a Teleport Waypoint the way the game's activation does.
// Its landmark's id joins the landmarks the save holds unlocked.
// A waypoint is named by the area it stands in, as the map names it.
export const unlockLandmark = (
  save: GenshinSave,
  { kind, name }: UnlockLandmarkArguments,
  tables: Pick<DevSaveTables, "catalogue" | "waypointLandmarks">,
): DevSaveOutcome => {
  const areaNames = createAreaNameMap(tables.catalogue);
  const regionCandidates = tables.catalogue.regions.flatMap((region) => {
    const landmarkId = RegionIdStatueLandmarkIdMap[region.id];
    return landmarkId === undefined ? [] : [{ landmarkId, name: region.name }];
  });
  const waypointCandidates = tables.waypointLandmarks.map((landmark) => ({
    landmarkId: landmark.id,
    name: areaNames.get(landmark.areaId) ?? "",
  }));
  const candidates = kind === DevUnlockKind.Region ? regionCandidates : waypointCandidates;
  const resolution = resolveDevName(candidates, ({ name: candidateName }) => candidateName, name, kind);
  if (!resolution.ok) return resolution;

  const { landmarkId, name: landmarkName } = resolution.entry;
  return {
    ok: true,
    save: { ...save, unlockedLandmarks: [...new Set([...save.unlockedLandmarks, landmarkId])] },
    value: landmarkName,
  };
};
