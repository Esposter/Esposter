import type { UnbanUserInput } from "#shared/models/db/moderation/UnbanUserInput";
import type { BanWithRelations, User } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

export const useBanStore = defineStore("message/user/ban", () => {
  const { $trpc } = useNuxtApp();
  const cursorPaginationData = ref(new CursorPaginationData<BanWithRelations>()) as Ref<
    CursorPaginationData<BanWithRelations>
  >;
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationOperationData(cursorPaginationData);

  const storeDeleteBan = (userId: User["id"]) => {
    items.value = items.value.filter((ban) => ban.userId !== userId);
  };

  const deleteBan = async (input: UnbanUserInput) => {
    await $trpc.moderation.unbanUser.mutate(input);
    storeDeleteBan(input.userId);
  };

  return { deleteBan, hasMore, items, readItems, readMoreItems, storeDeleteBan };
});
