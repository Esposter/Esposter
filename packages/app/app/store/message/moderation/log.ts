import type { ModerationLogEntity } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

export const useModerationLogStore = defineStore("message/moderation/log", () => {
  const cursorPaginationData = ref(new CursorPaginationData<ModerationLogEntity>()) as Ref<
    CursorPaginationData<ModerationLogEntity>
  >;
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationOperationData(cursorPaginationData);

  return { hasMore, items, readItems, readMoreItems };
});
