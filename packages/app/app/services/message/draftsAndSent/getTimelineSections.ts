import type { DraftsAndSentSection } from "@/models/message/draftsAndSent/DraftsAndSentSection";

import { getTimelineDateLabel } from "#shared/services/dayjs/getTimelineDateLabel";

export const getTimelineSections = <TItem>(
  items: TItem[],
  getDate: (item: TItem) => Date,
): DraftsAndSentSection<TItem>[] => {
  const sectionMap = new Map<string, DraftsAndSentSection<TItem>>();
  for (const item of items) {
    const title = getTimelineDateLabel(getDate(item));
    const section = sectionMap.get(title) ?? { items: [], title };
    section.items.push(item);
    sectionMap.set(title, section);
  }
  return [...sectionMap.values()];
};
