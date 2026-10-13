<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useInviteStore } from "@/store/message/room/invite";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendDialogStore } from "@/store/message/user/friendDialog";

const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const friendDialogStore = useFriendDialogStore();
const { invitingUserId } = storeToRefs(friendDialogStore);
const { isOpen, item: friend } = useSingletonDialog(invitingUserId, () =>
  friends.value.find(({ id }) => id === invitingUserId.value),
);
const directMessageStore = useDirectMessageStore();
const { inviteFriend } = directMessageStore;
const inviteStore = useInviteStore();
const { getUsableInviteLink } = inviteStore;
const { invitableRooms } = useInvitableRooms();
const roomItems = computed<UiListItem<string>[]>(() =>
  invitableRooms.value.map(({ id, image, name }) => ({ image, title: name, value: id })),
);
// The room's own link goes to the friend's direct message, the same send the room's invite dialog makes
const inviteToRoom = async (roomId: string) => {
  const room = invitableRooms.value.find(({ id }) => id === roomId);
  if (!room || !friend.value) return;

  const { id: friendId } = friend.value;
  isOpen.value = false;
  const inviteLink = await getUsableInviteLink(room);
  if (inviteLink) await inviteFriend(friendId, inviteLink);
};
</script>

<template>
  <StyledDialog v-if="friend" v-model="isOpen" :title="`Invite ${friend.name} to a room`">
    <UiList
      v-if="roomItems.length > 0"
      label="Rooms"
      :items="roomItems"
      max-h="[40dvh]"
      of-y-auto
      @select="(roomId) => inviteToRoom(roomId)"
    />
    <UiEmptyState
      v-else
      description="Invites can only be sent into a room you can manage invites in, and whose invites are not paused."
      :meaning="UiIconMeaning.Invite"
      title="No room to invite into"
    />
  </StyledDialog>
</template>
