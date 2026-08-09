import type { DeleteBanInput } from "#shared/models/db/moderation/DeleteBanInput";
import type { BanInMessageWithRelations } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useBanStore = defineStore("message/user/ban", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<BanInMessageWithRelations>();
  const { deleteBan: storeDeleteBan } = createOperationData(items, ["roomId", "userId"], DatabaseEntityType.Ban);

  const deleteBan = async (input: DeleteBanInput) => {
    await executeMutation(() => $trpc.message.moderation.deleteBan.mutate(input), {
      // Snapshotted when the write is sent rather than when it was issued: unbans run against one shared list,
      // So a failed one must restore the list as the unbans ahead of it left it, not resurrect the bans they lifted
      applyOptimistic: () => {
        const snapshot = [...items.value];
        storeDeleteBan(input);
        return () => {
          items.value = snapshot;
        };
      },
      // Keyed per room-user pair so concurrent unbans across bans run independently instead of queueing behind each other
      key: `${input.roomId}-${input.userId}`,
    });
  };

  return { deleteBan, hasMore, items, readItems, readMoreItems, storeDeleteBan };
});
