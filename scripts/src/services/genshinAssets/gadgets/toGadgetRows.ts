import type { ConfigWidgetRow } from "#src/models/genshinAssets/gadgets/ConfigWidgetRow";
import type { GadgetRow } from "genshin-world";

import { ConfigWidgetTypeGadgetKindMap } from "#src/services/genshinAssets/gadgets/ConfigWidgetTypeGadgetKindMap";
import { toGatherItemId } from "#src/services/genshinAssets/gadgets/toGatherItemId";

// The config's widgets of a kind the gadgets build, one row each by its id. A field the config omits reads as zero, or
// As Not equipable, and a widget naming no city, or a city in no region, has an empty region. A widget of another kind
// Has no Gather item, and a gather point finder's item is the one its type gives in the gather table
export const toGadgetRows = (
  widgets: Record<string, ConfigWidgetRow>,
  pointTypeItemIdMap: ReadonlyMap<number, number>,
  cityRegionMap: ReadonlyMap<number, string>,
): GadgetRow[] =>
  Object.entries(widgets)
    .flatMap(([id, widget]) => {
      const kind = ConfigWidgetTypeGadgetKindMap[widget.$type];
      const cityRegion = widget.allowCityId === undefined ? undefined : cityRegionMap.get(widget.allowCityId);
      return kind === undefined
        ? []
        : [
            {
              cooldownGroup: widget.coolDownGroup ?? 0,
              cooldownOnFailSeconds: widget.coolDownOnFail ?? 0,
              cooldownSeconds: widget.coolDown ?? 0,
              gatherItemId: kind === "GatherPointFinder" ? toGatherItemId(id, widget, pointTypeItemIdMap) : 0,
              id: Number(id),
              isEquipable: widget.isEquipable ?? false,
              kind,
              maxCountByPlayer: widget.maxCountByPlayer ?? 0,
              maxCountInScene: widget.maxCountInScene ?? 0,
              maxPoints: widget.maxPoints ?? 0,
              region: cityRegion ?? "",
            },
          ];
    })
    .toSorted((firstGadget, secondGadget) => firstGadget.id - secondGadget.id);
