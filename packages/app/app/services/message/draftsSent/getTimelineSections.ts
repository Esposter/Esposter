import type { DraftsSentSection } from "@/models/message/draftsSent/DraftsSentSection";

import { getTimelineDateLabel } from "#shared/services/dayjs/getTimelineDateLabel";

export const getTimelineSections = <TItem>(
  items: TItem[],
  getDate: (item: TItem) => Date,
): DraftsSentSection<TItem>[] => {
  const sectionMap = new Map<string, DraftsSentSection<TItem>>();
  for (const item of items) {
    const title = getTimelineDateLabel(getDate(item));
    const section = sectionMap.get(title) ?? { items: [], title };
    section.items.push(item);
    sectionMap.set(title, section);
  }
  return [...sectionMap.values()];
};
