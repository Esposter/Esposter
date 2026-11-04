import { findVisualList } from "#shared/services/dashboard/findVisualList";
import { NotFoundError } from "@esposter/shared";

// How many groups a visual sits inside, the top level counting as none. The caller finds the visual first, since an
// Id no visual holds is not a depth
export const getVisualDepth = <TVisual extends { id: string; visuals?: TVisual[] }>(
  visuals: TVisual[],
  id: TVisual["id"],
): number => {
  const list = findVisualList(visuals, id);
  if (!list) throw new NotFoundError("Visual", id);
  else if (!list.group) return 0;

  return getVisualDepth(visuals, list.group.id) + 1;
};
