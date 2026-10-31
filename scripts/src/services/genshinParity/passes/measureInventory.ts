import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";
import type { SceneLayout, ScenePlacement } from "genshin-engine";
import type { WitnessClaim } from "genshin-world/parity/models/witness/WitnessClaim";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { getComponentReferenceIds } from "#src/services/genshinParity/passes/getComponentReferenceIds";
import { UNDRAWN_PAGE_SIZE } from "#src/services/genshinParity/shared/constants";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { InvalidOperationError, jsonDateParse, Operation, withFinalizerAsync } from "@esposter/shared";
import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The inventory pass: every renderer of the component's exports claimed by a part of the scene, drawn or named as not
// Drawn yet, as its screen's fixture claims them on the parity page. The page is handed the placements' names and loads
// None of the exports: a capital's run to over a gigabyte of meshes and textures, which this process serves the page
// All at once, past 4 GB of its own memory, until the browser's connection drops
export const measureInventory = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const [referenceId] = getComponentReferenceIds(component);
  const reference = referenceId === undefined ? undefined : ParityReferenceMap[referenceId];
  if (!reference) throw new InvalidOperationError(Operation.Read, component, "no reference to open");
  const { placements } = jsonDateParse<SceneLayout>(
    await readFile(join(getComponentDirectory(component).root, WITNESS_LAYOUT_FILE_NAME), "utf8"),
  );
  const { close, page } = await openParityPage({
    height: UNDRAWN_PAGE_SIZE,
    screen: reference.screen,
    width: UNDRAWN_PAGE_SIZE,
  });
  return withFinalizerAsync(
    async () => {
      const claims = await page.evaluate(
        ([renderers, witnessComponent]) =>
          (
            Reflect.get(window, "claimWitnessRenderers") as (
              placements: Pick<ScenePlacement, "materials" | "mesh">[],
              witnessComponent: string,
            ) => WitnessClaim[]
          )(renderers, witnessComponent),
        [placements.map(({ materials, mesh }) => ({ materials, mesh })), component] as const,
      );
      const unclaimed = claims.filter(({ claim }) => !claim);
      return {
        notes: [
          ...unclaimed.map(({ renderer }) => `unclaimed: ${renderer}`),
          ...claims
            .filter(({ claim, isDrawn }) => claim && !isDrawn)
            .map(({ claim, renderer }) => `not drawn yet, as ${claim}: ${renderer}`),
        ],
        readings: [{ gate: 0, name: "renderers unclaimed", unit: "renderers", value: unclaimed.length }],
      };
    },
    () => close(),
  );
};
