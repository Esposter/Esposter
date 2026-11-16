<script setup lang="ts">
import type { useContextMenu } from "#src/composables/ui/useContextMenu";
import type { Item } from "#src/models/shared/Item";
import type { PublicUser } from "@esposter/db-schema";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useBlockStore } from "#src/store/message/user/block";
import { useFriendDialogStore } from "#src/store/message/user/friendDialog";

interface Props {
  // The list's own context menu, so one press is tracked across every friend's row
  getContextMenuProps: ReturnType<typeof useContextMenu>["getContextMenuProps"];
  id: PublicUser["id"];
  image: PublicUser["image"];
  name: PublicUser["name"];
}

const { id } = defineProps<Props>();
const blockStore = useBlockStore();
const { createBlock } = blockStore;
const friendDialogStore = useFriendDialogStore();
const { invitingUserId, removingUserId } = storeToRefs(friendDialogStore);
const { invitableRooms } = useInvitableRooms();
// What a friend's row does, behind its overflow mark and its context menu alike, as Discord keeps them under More
const items = computed<Item[]>(() => [
  ...(invitableRooms.value.length > 0
    ? [
        {
          meaning: UiIconMeaning.Invite,
          onClick: () => {
            invitingUserId.value = id;
          },
          title: "Invite to room",
        },
      ]
    : []),
  {
    meaning: UiIconMeaning.Remove,
    onClick: () => {
      removingUserId.value = id;
    },
    title: "Remove friend",
  },
  {
    isDanger: true,
    meaning: UiIconMeaning.Block,
    onClick: async () => {
      await createBlock(id);
    },
    title: "Block",
  },
]);
</script>

<template>
  <MessageFriendsUserListItem :="getContextMenuProps(id, () => items)" :image :name>
    <template #append>
      <UiOverflowMenu :items :label="`${name} actions`" />
    </template>
  </MessageFriendsUserListItem>
</template>
