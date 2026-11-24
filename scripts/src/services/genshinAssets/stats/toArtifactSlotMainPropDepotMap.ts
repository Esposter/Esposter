import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";

import { takeOne } from "@esposter/shared";
import { ArtifactSlot } from "genshin-world/definitions";

// The depot each slot's standard pieces draw their main affix from, read from the reliquary table: the depot most of a
// Slot's pieces draw, since the events' pieces draw others
export const toArtifactSlotMainPropDepotMap = (rows: readonly ExcelReliquaryRow[]): ReadonlyMap<ArtifactSlot, number> =>
  new Map(
    Object.values(ArtifactSlot).map((slot): [ArtifactSlot, number] => {
      const counts = new Map<number, number>();
      for (const { equipType, mainPropDepotId } of rows)
        if (equipType === slot) counts.set(mainPropDepotId, (counts.get(mainPropDepotId) ?? 0) + 1);
      const [mainPropDepotId] = takeOne(
        [...counts].toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount),
        0,
      );
      return [slot, mainPropDepotId];
    }),
  );
