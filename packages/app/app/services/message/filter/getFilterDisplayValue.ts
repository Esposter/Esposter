/* eslint-disable perfectionist/sort-switch-case */
import type { Filter } from "@esposter/db-schema";

import { useMemberStore } from "@/store/message/user/member";
import { FilterType, serializeValue } from "@esposter/db-schema";
import { InvalidOperationError, Operation, uncapitalize } from "@esposter/shared";

export const getFilterDisplayValue = ({ type, value }: Filter) => {
  const displayType = `${uncapitalize(type)}:`;
  if (!value) return displayType;

  switch (type) {
    case FilterType.From:
    case FilterType.Mentions: {
      if (typeof value !== "string")
        throw new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));
      const memberStore = useMemberStore();
      const { memberMap } = storeToRefs(memberStore);
      const member = memberMap.value.get(value);
      return `${displayType} ${member?.name ?? value}`;
    }
    case FilterType.Has:
      if (typeof value !== "string")
        throw new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));
      return `${displayType} ${uncapitalize(value)}`;
    case FilterType.Before:
    case FilterType.During:
    case FilterType.After:
      if (value instanceof Date) return `${displayType} ${value.toLocaleDateString()}`;
      else if (typeof value === "string") return `${displayType} ${new Date(value).toLocaleDateString()}`;
      else throw new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));
    case FilterType.Pinned:
      if (typeof value !== "boolean")
        throw new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value));
      return `${displayType} ${value}`;
  }
};
