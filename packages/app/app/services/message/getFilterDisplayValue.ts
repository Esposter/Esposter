/* eslint-disable perfectionist/sort-switch-case */
import type { Filter } from "#shared/models/message/Filter";

import { FilterType } from "#shared/models/message/FilterType";
import { useRoomStore } from "@/store/message/room";
import { uncapitalize } from "@esposter/shared";

export const getFilterDisplayValue = ({ type, value }: Filter) => {
  const displayType = `${uncapitalize(type)}:`;
  if (!value) return displayType;

  switch (type) {
    case FilterType.From:
    case FilterType.Mentions: {
      const roomStore = useRoomStore();
      const { memberMap } = storeToRefs(roomStore);
      return `${displayType} ${memberMap.value.get(value)?.name ?? value}`;
    }
    case FilterType.Has: {
      return `${displayType} ${uncapitalize(value)}`;
    }
    case FilterType.Before:
    case FilterType.During:
    case FilterType.After: {
      return `${displayType} ${new Date(value).toLocaleDateString()}`;
    }
    case FilterType.Pinned: {
      return `${displayType} ${value}`;
    }
  }
};
