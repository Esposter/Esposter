<script setup lang="ts">
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { getInviteLink } from "@/services/message/room/invite/getInviteLink";
import { searchItems } from "@/services/search/searchItems";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useInviteStore } from "@/store/message/room/invite";
import { useFriendStore } from "@/store/message/user/friend";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const directMessageStore = useDirectMessageStore();
const { directMessages } = storeToRefs(directMessageStore);
const { checkIsInviteFriendPending, getDirectMessageParticipants, inviteFriend } = directMessageStore;
const inviteStore = useInviteStore();
const { invites } = storeToRefs(inviteStore);
// A paused room has no usable link to send, and the invite the reader holds is the one the send carries
const invite = computed(() => invites.value.get(room.id));
const inviteLink = computed(() =>
  invite.value && !room.isInvitePaused ? getInviteLink(runtimeConfig.public.baseUrl, invite.value.id) : "",
);
const searchQuery = ref("");
// Ranks each friend by the newest direct message they are in, so the friend the reader talked to last leads, as
// Discord's dialog does. A friend with none keeps their place in the friends list behind every one who has one
const friendRecencyMap = computed(() => {
  const recencyMap = new Map<PublicUser["id"], number>();
  directMessages.value.forEach(({ id }, index) => {
    for (const { id: participantId } of getDirectMessageParticipants(id))
      if (!recencyMap.has(participantId)) recencyMap.set(participantId, index);
  });
  return recencyMap;
});
const getFriendRecency = (userId: PublicUser["id"]) => friendRecencyMap.value.get(userId) ?? Number.MAX_SAFE_INTEGER;
const friendItems = computed(() =>
  searchItems(
    friends.value.toSorted(
      (firstFriend, secondFriend) => getFriendRecency(firstFriend.id) - getFriendRecency(secondFriend.id),
    ),
    searchQuery.value,
    ({ name }) => ({ name }),
  ),
);
// Which friends are already members is read once the friends are, since a member row reads Joined and is disabled
const { data: roomMembers, refresh: readRoomMembers } = useQuery(
  () => $trpc.room.readMembersByIds.query({ roomId: room.id, userIds: friends.value.map(({ id }) => id) }),
  { isLazy: true },
);
const memberIdSet = computed(() => new Set((roomMembers.value ?? []).map(({ id }) => id)));
const readFriends = useReadFriends();

onMounted(async () => {
  await readFriends();
  await readRoomMembers();
});
</script>

<template>
  <div flex flex-col gap-2>
    <UiTextField v-model="searchQuery" label="Search friends" :type="UiTextFieldType.Search" />
    <ul v-if="friendItems.length > 0" max-h="[40dvh]" flex flex-col of-y-auto>
      <MessageFriendsUserListItem v-for="{ id, image, name } of friendItems" :key="id" :image :name>
        <template #append>
          <UiButton v-if="memberIdSet.has(id)" disabled>Joined</UiButton>
          <UiButton
            v-else
            :disabled="!inviteLink"
            :is-pending="checkIsInviteFriendPending(id)"
            :variant="UiButtonVariant.Accent"
            @click="inviteFriend(id, inviteLink)"
          >
            Invite
          </UiButton>
        </template>
      </MessageFriendsUserListItem>
    </ul>
    <UiEmptyState
      v-else
      :description="searchQuery ? 'No friend of yours goes by that name.' : undefined"
      :meaning="UiIconMeaning.Person"
      title="No friends found"
    />
  </div>
</template>
