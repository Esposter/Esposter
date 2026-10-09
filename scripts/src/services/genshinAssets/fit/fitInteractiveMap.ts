import type { InteractiveMapFitFile } from "#src/models/genshinAssets/points/InteractiveMapFitFile";
import type { InteractiveMapRegionFit } from "#src/models/genshinAssets/points/InteractiveMapRegionFit";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { OculusKindLabelIdMap } from "#src/services/genshinAssets/oculi/OculusKindLabelIdMap";
import { computeResidual } from "#src/services/genshinAssets/points/computeResidual";
import {
  INTERACTIVE_MAP_DIRECTORY,
  INTERACTIVE_MAP_FIT_BAR,
  INTERACTIVE_MAP_FIT_PATH,
  INTERACTIVE_MAP_STATUE_LABEL_ID,
  INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
} from "#src/services/genshinAssets/points/constants";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { matchSimilarity } from "#src/services/genshinAssets/points/matchSimilarity";
import { readInteractiveMapPoints } from "#src/services/genshinAssets/points/readInteractiveMapPoints";
import { readSceneTransportPoints } from "#src/services/genshinAssets/world/readSceneTransportPoints";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";

// The official map fitted to the scene: one similarity carries the map's statues and waypoints onto the scene's transport
// Points, and each region's share of its matches and of its Oculi is reported, Mondstadt's first. A fit over its bar
// Writes nothing and is an error, its residual in the message; one under it writes the transform, the residual and
// Each region's share to the references folder, and returns the report the command prints
export const fitInteractiveMap = async (): Promise<string> => {
  const [points, transportPoints] = await Promise.all([readInteractiveMapPoints(), readSceneTransportPoints()]);
  // The map's statues and waypoints on the ground, its underground layers' points kept for their own floors
  const anchors = points.filter(
    ({ label_id, z_level }) =>
      z_level === 0 && (label_id === INTERACTIVE_MAP_STATUE_LABEL_ID || label_id === INTERACTIVE_MAP_WAYPOINT_LABEL_ID),
  );
  const fit = matchSimilarity(
    anchors.map(({ x_pos, y_pos }) => ({ x: x_pos, z: y_pos })),
    transportPoints.map(({ position }) => position),
  );
  const residual = roundFitted(fit.residual);
  if (fit.residual > INTERACTIVE_MAP_FIT_BAR)
    throw new InvalidOperationError(
      Operation.Read,
      "interactive map",
      `fits at a residual of ${residual} game units, over its bar of ${INTERACTIVE_MAP_FIT_BAR}; nothing written`,
    );
  const regions: InteractiveMapRegionFit[] = Object.entries(InteractiveMapRegionMap).map(
    ([region, { areaId, oculus }]) => {
      const pairs = fit.pairs.filter(({ fromIndex }) => anchors[fromIndex]?.area_id === areaId);
      return {
        matched: pairs.length,
        oculusCount: points.filter(
          ({ area_id, label_id }) => area_id === areaId && label_id === OculusKindLabelIdMap[oculus.kind],
        ).length,
        oculusWikiCount: oculus.count,
        region,
        residual: pairs.length > 0 ? roundFitted(computeResidual(pairs)) : undefined,
      };
    },
  );
  const file: InteractiveMapFitFile = { regions, residual, transform: fit.transform };
  await mkdir(INTERACTIVE_MAP_DIRECTORY, { recursive: true });
  await writeFile(INTERACTIVE_MAP_FIT_PATH, `${JSON.stringify(file, null, 2)}\n`);
  return [
    `${fit.pairs.length} of ${anchors.length} statues and waypoints matched, residual ${residual} game units (bar ${INTERACTIVE_MAP_FIT_BAR})`,
    ...regions.map(
      ({ matched, oculusCount, oculusWikiCount, region, residual: regionResidual }) =>
        `${region}: ${matched} matched, residual ${regionResidual ?? "none"}, Oculi ${oculusCount} of ${oculusWikiCount}`,
    ),
  ].join("\n");
};
