<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { PublicUser } from "@esposter/db-schema";

import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendDialogStore } from "@/store/message/user/friendDialog";

const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const friendDialogStore = useFriendDialogStore();
const { removingUserId } = storeToRefs(friendDialogStore);
const blockStore = useBlockStore();
const { createBlock } = blockStore;
const { getContextMenuProps } = useContextMenu();
const displayFriends = computed(() =>
  friends.value.toSorted((firstFriend, secondFriend) => compareCreatedAt(secondFriend, firstFriend)),
);
// What a friend's row does, behind its overflow mark and its context menu alike, as Discord keeps them under More
const getFriendItems = (userId: PublicUser["id"]): Item[] => [
  {
    meaning: UiIconMeaning.Remove,
    onClick: () => {
      removingUserId.value = userId;
    },
    title: "Remove friend",
  },
  {
    isDanger: true,
    meaning: UiIconMeaning.Block,
    onClick: async () => {
      await createBlock(userId);
    },
    title: "Block",
  },
];
</script>

<template>
  <MessageFriendsSection :title="`Friends — ${displayFriends.length}`">
    <ul v-if="displayFriends.length > 0" flex flex-col>
      <MessageFriendsUserListItem
        v-for="{ id, name, image } of displayFriends"
        :key="id"
        :="getContextMenuProps(id, () => getFriendItems(id))"
        :image
        :name
      >
        <template #append>
          <UiOverflowMenu :items="getFriendItems(id)" :label="`${name} actions`" />
        </template>
      </MessageFriendsUserListItem>
    </ul>
    <UiEmptyState
      v-else
      description="Search for someone above to add them."
      :meaning="UiIconMeaning.Person"
      title="No friends yet"
    />
    <MessageFriendsConfirmRemoveFriendDialog />
  </MessageFriendsSection>
</template>
