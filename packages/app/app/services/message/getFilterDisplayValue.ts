import type { Filter } from "#shared/models/message/Filter";

import { FilterType } from "#shared/models/message/FilterType";
import { useRoomStore } from "@/store/message/room";
import { NotFoundError, uncapitalize } from "@esposter/shared";

export const getFilterDisplayValue = ({ type, value }: Filter) => {
  switch (type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case FilterType.From: {
      const roomStore = useRoomStore();
      const { memberMap } = storeToRefs(roomStore);
      return `${uncapitalize(type)}: ${memberMap.value.get(value)?.name ?? value}`;
    }
    default:
      throw new NotFoundError(getFilterDisplayValue.name, type);
  }
};
