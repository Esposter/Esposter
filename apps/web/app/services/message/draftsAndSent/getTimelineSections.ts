import type { DraftsAndSentSection } from "@/models/message/draftsAndSent/DraftsAndSentSection";

import { getTimelineDateLabel } from "@/util/date/getTimelineDateLabel";
import { getOrCreate } from "@esposter/shared";

export const getTimelineSections = <TItem>(
  items: TItem[],
  getDate: (item: TItem) => Date,
): DraftsAndSentSection<TItem>[] => {
  const sectionMap = new Map<string, DraftsAndSentSection<TItem>>();
  for (const item of items) {
    const title = getTimelineDateLabel(getDate(item));
    getOrCreate(sectionMap, title, () => ({ items: [], title })).items.push(item);
  }
  return [...sectionMap.values()];
};
