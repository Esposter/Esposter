/* eslint-disable perfectionist/sort-switch-case */
import type { Filter } from "#shared/models/message/Filter";

import { FilterType } from "#shared/models/message/FilterType";
import { useRoomStore } from "@/store/message/room";
import { InvalidOperationError, Operation, serializeValue, uncapitalize } from "@esposter/shared";

export const getFilterDisplayValue = ({ type, value }: Filter) => {
  const displayType = `${uncapitalize(type)}:`;
  if (!value) return displayType;

  switch (type) {
    case FilterType.From:
    case FilterType.Mentions: {
      if (typeof value !== "string")
        throw new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));
      const roomStore = useRoomStore();
      const { memberMap } = storeToRefs(roomStore);
      return `${displayType} ${memberMap.value.get(value)?.name ?? value}`;
    }
    case FilterType.Has:
      if (typeof value !== "string")
        throw new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));
      return `${displayType} ${uncapitalize(value)}`;
    case FilterType.Before:
    case FilterType.During:
    case FilterType.After:
      if (!(value instanceof Date))
        throw new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));
      return `${displayType} ${value.toLocaleDateString()}`;
    case FilterType.Pinned:
      if (typeof value !== "boolean")
        throw new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));
      return `${displayType} ${value}`;
  }
};
