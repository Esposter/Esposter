import type { SerializableValue } from "@esposter/azure";
import type { Filter } from "@esposter/db-schema";

/* eslint-disable perfectionist/sort-switch-case */
import { checkIsFilterPending } from "#shared/services/message/checkIsFilterPending";
import { getFilterKeyword } from "@/services/message/filter/getFilterKeyword";
import { useRoomStore } from "@/store/message/room";
import { useUserStore } from "@/store/message/user";
import { serializeValue } from "@esposter/azure";
import { FilterType } from "@esposter/db-schema";
import { exhaustiveGuard, InvalidOperationError, Operation, uncapitalize } from "@esposter/shared";

// Every picker writes the shape its own filter type declares, so a value of any other shape is a bug in the
// Picker rather than something the user typed — it is refused rather than rendered as `[object Object]`
const getInvalidValueError = (value: SerializableValue) =>
  new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));

export const getFilterDisplayValue = (filter: Filter) => {
  const { type, value } = filter;
  const filterKeyword = getFilterKeyword(type);
  if (checkIsFilterPending(filter)) return filterKeyword;

  const displayValue = getDisplayValue(type, value);
  return `${filterKeyword} ${displayValue}`;
};

const getDisplayValue = (type: FilterType, value: SerializableValue) => {
  switch (type) {
    case FilterType.From:
    case FilterType.Mentions: {
      if (typeof value !== "string") throw getInvalidValueError(value);

      const userStore = useUserStore();
      const { userMap } = storeToRefs(userStore);
      const user = userMap.value.get(value);
      return user?.name ?? value;
    }
    case FilterType.In: {
      if (typeof value !== "string") throw getInvalidValueError(value);

      const roomStore = useRoomStore();
      const { rooms } = storeToRefs(roomStore);
      const room = rooms.value.find(({ id }) => id === value);
      return room?.name ?? value;
    }
    case FilterType.Has:
      if (typeof value !== "string") throw getInvalidValueError(value);
      return uncapitalize(value);
    case FilterType.Before:
    case FilterType.During:
    case FilterType.After:
      if (value instanceof Date) return value.toLocaleDateString();
      else if (typeof value === "string") return new Date(value).toLocaleDateString();
      else throw getInvalidValueError(value);
    case FilterType.Pinned:
      if (typeof value !== "boolean") throw getInvalidValueError(value);
      return String(value);
    default:
      return exhaustiveGuard(type);
  }
};
