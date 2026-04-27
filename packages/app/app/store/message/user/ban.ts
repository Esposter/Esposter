import type { DeleteBanInput } from "#shared/models/db/moderation/DeleteBanInput";
import type { BanInMessageWithRelations } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useBanStore = defineStore("message/user/ban", () => {
  const { $trpc } = useNuxtApp();
  const cursorPaginationData = ref(new CursorPaginationData<BanInMessageWithRelations>()) as Ref<
    CursorPaginationData<BanInMessageWithRelations>
  >;
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationOperationData(cursorPaginationData);
  const { deleteBan: storeDeleteBan } = createOperationData(items, ["roomId", "userId"], DatabaseEntityType.Ban);

  const deleteBan = async (input: DeleteBanInput) => {
    await $trpc.moderation.deleteBan.mutate(input);
    storeDeleteBan(input);
  };

  return { deleteBan, hasMore, items, readItems, readMoreItems, storeDeleteBan };
});
