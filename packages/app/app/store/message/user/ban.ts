import type { DeleteBanInput } from "#shared/models/db/moderation/DeleteBanInput";
import type { BanInMessageWithRelations } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useBanStore = defineStore("message/user/ban", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<BanInMessageWithRelations>();
  const { deleteBan: storeDeleteBan } = createOperationData(items, ["roomId", "userId"], DatabaseEntityType.Ban);

  const deleteBan = async (input: DeleteBanInput) => {
    const snapshot = [...items.value];
    await executeMutation(() => $trpc.message.moderation.deleteBan.mutate(input), {
      applyOptimistic: () => {
        storeDeleteBan(input);
        return () => {
          items.value = snapshot;
        };
      },
    });
  };

  return { deleteBan, hasMore, items, readItems, readMoreItems, storeDeleteBan };
});
