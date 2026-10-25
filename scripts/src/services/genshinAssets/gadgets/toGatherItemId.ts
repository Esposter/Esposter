import type { ConfigWidgetRow } from "#src/models/genshinAssets/gadgets/ConfigWidgetRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The item a gather point finder finds, by the gather point type its widget names. A type the gather table gives no item
// Is refused, so the stone is not published with a target it cannot have
export const toGatherItemId = (
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
