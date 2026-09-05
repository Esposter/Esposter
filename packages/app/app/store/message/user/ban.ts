import type { DeleteBanInput } from "#shared/models/db/moderation/DeleteBanInput";
import type { BanInMessageWithRelations } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";

export const useBanStore = defineStore("message/user/ban", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<BanInMessageWithRelations>();
  const { createBan: storeCreateBan, deleteBan: storeDeleteBan } = createOperationData(
    items,
    ["roomId", "userId"],
    DatabaseEntityType.Ban,
  );

  const deleteBan = async (input: DeleteBanInput) => {
    await executeMutation(() => $trpc.message.moderation.deleteBan.mutate(input), {
      // The one row this write lifts — unbans are keyed per ban and never queue against each other
      applyOptimistic: () => {
        const deletedBan = items.value.find(({ roomId, userId }) => roomId === input.roomId && userId === input.userId);
        storeDeleteBan(input);
        return () => {
          if (deletedBan) storeCreateBan(deletedBan);
        };
      },
      key: `${input.roomId}${ID_SEPARATOR}${input.userId}`,
    });
  };

  return { deleteBan, hasMore, items, readItems, readMoreItems, storeDeleteBan };
});
