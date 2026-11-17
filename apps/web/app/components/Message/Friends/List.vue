<script setup lang="ts">
import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useFriendStore } from "#src/store/message/user/friend";

const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const { getContextMenuProps } = useContextMenu();
const { invitableRooms } = useInvitableRooms();
const hasInvitableRoom = computed(() => invitableRooms.value.length > 0);
const displayFriends = computed(() =>
  friends.value.toSorted((firstFriend, secondFriend) => compareCreatedAt(secondFriend, firstFriend)),
);
</script>

<template>
  <MessageFriendsSection :title="`Friends — ${displayFriends.length}`">
    <ul v-if="displayFriends.length > 0" flex flex-col>
      <MessageFriendsFriendListItem
        v-for="{ id, name, image } of displayFriends"
        :id
        :key="id"
        :has-invitable-room
        :get-context-menu-props
        :image
        :name
      />
    </ul>
    <UiEmptyState
      v-else
      description="Search for someone above to add them."
      :meaning="UiIconMeaning.Person"
      title="No friends yet"
    />
    <MessageFriendsConfirmRemoveFriendDialog />
    <MessageFriendsInviteToRoomDialog />
  </MessageFriendsSection>
</template>
