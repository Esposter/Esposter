import type { ConfigWidgetRow } from "#src/models/genshinAssets/gadgets/ConfigWidgetRow";
import type { GadgetSliceRow } from "#src/models/genshinAssets/gadgets/GadgetSliceRow";

import { ConfigWidgetTypeGadgetKindMap } from "#src/services/genshinAssets/gadgets/ConfigWidgetTypeGadgetKindMap";
import { CityIdRegionMap } from "#src/services/genshinAssets/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The item a gather point finder finds, by the gather point type its widget names. A type the gather table gives no item
// Is refused, so the stone is not published with a target it cannot have
const toGatherItemId = (
  id: string,
  { gatherPointType }: ConfigWidgetRow,
  pointTypeItemIdMap: ReadonlyMap<number, number>,
) => {
  const itemId = gatherPointType === undefined ? undefined : pointTypeItemIdMap.get(gatherPointType);
  if (itemId === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      `widget ${id}`,
      `names gather point type ${gatherPointType ?? "none"}, which the gather table gives no item`,
    );
  return itemId;
};

// The config's widgets of a kind the gadgets build, one row each by its id. A field the config omits reads as zero, or as
// Not equipable, and a widget naming no city, or a city in no region, has an empty region. A widget of another kind has no
// Gather item, and a gather point finder's item is the one its type gives in the gather table
export const toGadgetRows = (
  widgets: Record<string, ConfigWidgetRow>,
  pointTypeItemIdMap: ReadonlyMap<number, number>,
): GadgetSliceRow[] =>
  Object.entries(widgets)
    .flatMap(([id, widget]) => {
      const kind = ConfigWidgetTypeGadgetKindMap[widget.$type];
      const cityRegion = widget.allowCityId === undefined ? undefined : CityIdRegionMap[widget.allowCityId];
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
