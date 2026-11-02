import type { DraftsAndSentSection } from "@/models/message/draftsAndSent/DraftsAndSentSection";

import { getPlainDate } from "@/util/date/getPlainDate";
import { getTimelineDateLabel } from "@/util/date/getTimelineDateLabel";
import { getOrCreate } from "@esposter/shared";

// Keyed by the day, so each section is one day's items, whatever its heading reads
export const getTimelineSections = <TItem>(items: TItem[], getDate: (item: TItem) => Date) => {
  const sectionMap = new Map<string, DraftsAndSentSection<TItem>>();
  for (const item of items) {
    const date = getDate(item);
    getOrCreate(sectionMap, getPlainDate(date).toString(), () => ({
      items: [],
      title: getTimelineDateLabel(date),
    })).items.push(item);
  }
  return [...sectionMap.values()];
};
