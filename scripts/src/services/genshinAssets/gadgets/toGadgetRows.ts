import type { ConfigWidgetRow } from "#src/models/genshinAssets/gadgets/ConfigWidgetRow";
import type { GadgetSliceRow } from "#src/models/genshinAssets/gadgets/GadgetSliceRow";

import { ConfigWidgetTypeGadgetKindMap } from "#src/services/genshinAssets/gadgets/ConfigWidgetTypeGadgetKindMap";

// The config's widgets of a kind the gadgets build, one row each by its id. A field the config omits reads as zero, or as
// Not equipable
export const toGadgetRows = (widgets: Record<string, ConfigWidgetRow>): GadgetSliceRow[] =>
  Object.entries(widgets)
    .flatMap(([id, widget]) => {
      const kind = ConfigWidgetTypeGadgetKindMap[widget.$type];
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
            },
          ];
    })
    .toSorted((firstGadget, secondGadget) => firstGadget.id - secondGadget.id);
