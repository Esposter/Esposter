import type { ConfigWidgetRow } from "#src/models/genshinAssets/gadgets/ConfigWidgetRow";
import type { GadgetSliceRow } from "#src/models/genshinAssets/gadgets/GadgetSliceRow";

import { ConfigWidgetTypeGadgetKindMap } from "#src/services/genshinAssets/gadgets/ConfigWidgetTypeGadgetKindMap";
import { CityIdRegionMap } from "#src/services/genshinAssets/shared/constants";

// The config's widgets of a kind the gadgets build, one row each by its id. A field the config omits reads as zero, or as
// Not equipable, and a widget naming no city, or a city in no region, has an empty region
export const toGadgetRows = (widgets: Record<string, ConfigWidgetRow>): GadgetSliceRow[] =>
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
              id: Number(id),
              isEquipable: widget.isEquipable ?? false,
              kind,
              region: cityRegion ?? "",
            },
          ];
    })
    .toSorted((firstGadget, secondGadget) => firstGadget.id - secondGadget.id);
