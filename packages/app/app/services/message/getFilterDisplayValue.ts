import type { Filter } from "#shared/models/message/Filter";

import { FilterType } from "#shared/models/message/FilterType";
import { useMessageStore } from "@/store/message";
import { NotFoundError } from "@esposter/shared";

export const getFilterDisplayValue = ({ type, value }: Filter) => {
  switch (type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case FilterType.From: {
      const messageStore = useMessageStore();
      const { userMap } = storeToRefs(messageStore);
      return `${type}: ${userMap.value.get(value)?.name ?? value}`;
    }
    default:
      throw new NotFoundError(getFilterDisplayValue.name, type);
  }
};
