import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { BlockInSocialWithRelations } from "@esposter/db-schema";

import { blockTable } from "#src/services/message/user/pair/constants";
import { createPairConfirmations } from "#src/services/message/user/pair/createPairConfirmations";
import { getBlockEntry } from "#src/services/message/user/pair/getBlockEntry";
import { getUnblockEntry } from "#src/services/message/user/pair/getUnblockEntry";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";

export const useBlockStore = defineStore("message/user/block", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { view, writeOptimistic } = overlayStore;
  const userStore = useUserStore();
  const { storeUser } = userStore;
  const blocks = view(blockTable);
  // A block names the user it blocks, whose row the block's answer or the read stored, so a block whose user is not held
  // Yet shows nothing
  const blockedUsers = computed(() =>
    blocks.value.flatMap(({ blockedId, blockerId }) => {
      const blockedUser = blockerId === userId.value ? userStore.userMap.get(blockedId) : undefined;
      return blockedUser ? [blockedUser] : [];
    }),
  );
  const createBlock = (targetUserId: FriendUserIdInput) => {
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() => $trpc.block.createBlock.mutate(targetUserId));
        storeUser(result);
        return { arrivals: [], confirmed: createPairConfirmations(rowVersions) };
      },
      { entry: getBlockEntry(userId.value, targetUserId, new Date()), onError: createErrorAlert },
    );
  };

  const deleteBlock = (blockedUserId: FriendUserIdInput) => {
    writeOptimistic(
      async () => {
        const { rowVersions } = await collectRowVersions(() => $trpc.block.deleteBlock.mutate(blockedUserId));
        return { arrivals: [], confirmed: createPairConfirmations(rowVersions) };
      },
      { entry: getUnblockEntry(userId.value, blockedUserId, new Date()), onError: createErrorAlert },
    );
  };
  // The read's rows are the blocks with their tombstones, each with the user it blocks
  const readBlockedUsers = useOverlayRead(blockTable, ({ blocked, ...block }: BlockInSocialWithRelations) => {
    storeUser(blocked);
    return block;
  });

  return { blockedUsers, createBlock, deleteBlock, readBlockedUsers };
});
