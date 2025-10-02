import type { Filter } from "#shared/models/message/Filter";

import { FilterType } from "#shared/models/message/FilterType";
import { useRoomStore } from "@/store/message/room";
import { NotFoundError, uncapitalize } from "@esposter/shared";

export const getFilterDisplayValue = ({ type, value }: Filter) => {
  switch (type) {
    case FilterType.From:
    case FilterType.Mentions: {
      const roomStore = useRoomStore();
      const { memberMap } = storeToRefs(roomStore);
      return `${uncapitalize(type)}: ${memberMap.value.get(value)?.name ?? value}`;
    }
    case FilterType.Before:
    case FilterType.During:
    case FilterType.After: {
      const date = new Date(value);
      const isValid = !Number.isNaN(date.getTime());
      const formatted = isValid ? date.toLocaleDateString() : value;
      return `${uncapitalize(type)}: ${formatted}`;
    }
    default:
      throw new NotFoundError(getFilterDisplayValue.name, type);
  }
};
