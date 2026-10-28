import type { SerializableValue } from "@esposter/azure";

import { getInvalidValueError } from "@/services/message/filter/getInvalidValueError";
import { useRoomStore } from "@/store/message/room";
import { useUserStore } from "@/store/message/user";
import { FilterType, filterTypeAuthorTypeSchema } from "@esposter/db-schema";
import { exhaustiveGuard, uncapitalize } from "@esposter/shared";

// `functionName` is the public function the value was read for, so a refused value names the caller's function
export const getDisplayValue = (type: FilterType, value: SerializableValue, functionName: string) => {
  switch (type) {
    case FilterType.After:
    case FilterType.Before:
    case FilterType.During:
      if (value instanceof Date) return value.toLocaleDateString();
      else if (typeof value === "string") return new Date(value).toLocaleDateString();
      else throw getInvalidValueError(functionName, value);
    case FilterType.Pinned:
      if (typeof value !== "boolean") throw getInvalidValueError(functionName, value);
      return String(value);
    case FilterType.AuthorType: {
      const authorType = filterTypeAuthorTypeSchema.safeParse(value);
      if (!authorType.success) throw getInvalidValueError(functionName, value);
      return uncapitalize(authorType.data);
    }
    case FilterType.From:
    case FilterType.Mentions: {
      if (typeof value !== "string") throw getInvalidValueError(functionName, value);

      const userStore = useUserStore();
      const { userMap } = storeToRefs(userStore);
      const user = userMap.value.get(value);
      return user?.name ?? value;
    }
    case FilterType.Has:
      if (typeof value !== "string") throw getInvalidValueError(functionName, value);
      return uncapitalize(value);
    case FilterType.In: {
      if (typeof value !== "string") throw getInvalidValueError(functionName, value);

      const roomStore = useRoomStore();
      const { rooms } = storeToRefs(roomStore);
      const room = rooms.value.find(({ id }) => id === value);
      return room?.name ?? value;
    }
    default:
      return exhaustiveGuard(type);
  }
};
