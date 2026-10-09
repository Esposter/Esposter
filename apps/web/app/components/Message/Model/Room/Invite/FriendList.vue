<script setup lang="ts">
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { DEFAULT_INVITE_EXPIRE_AFTER_MINUTES, INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
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
const { createInvite } = inviteStore;
const { invites } = storeToRefs(inviteStore);
// A paused room has no usable link to send, and the invite the reader holds is the one the send carries
const invite = computed(() => invites.value.get(room.id));
const isInviteSendable = computed(() => Boolean(invite.value) && !room.isInvitePaused);
// The invite can lapse or run out of uses while the dialog is open, so the click rechecks it and mints a fresh one with
// The same use limit, as the manager's own read does, before a link is sent
const sendInvite = async (friendId: PublicUser["id"]) => {
  if (!invite.value || room.isInvitePaused) return;
  if (!checkIsInviteUsable(invite.value)) {
    const { maxUses } = invite.value;
    await createInvite({
      expireAfterMinutes: DEFAULT_INVITE_EXPIRE_AFTER_MINUTES,
      maxUses: INVITE_MAX_USES_OPTIONS.find((uses) => uses === maxUses) ?? 0,
      roomId: room.id,
    });
  }
  const usableInvite = invites.value.get(room.id);
  if (!usableInvite || !checkIsInviteUsable(usableInvite)) return;
  await inviteFriend(friendId, getInviteLink(runtimeConfig.public.baseUrl, usableInvite.id));
};
const searchQuery = ref("");
// Ranks each friend by the newest direct message they are in, so the friend the reader talked to last leads, as
// Discord's dialog does. A friend with none keeps their place in the friends list behind every one who has one
const friendRecencyMap = computed(() => {
  const recencyMap = new Map<PublicUser["id"], number>();
  for (const [index, { id }] of directMessages.value.entries())
    for (const { id: participantId } of getDirectMessageParticipants(id))
      if (!recencyMap.has(participantId)) recencyMap.set(participantId, index);
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
// Which friends are already members is read once the friends are, since a member row reads Joined and is disabled. With
// No friends there is nobody to ask about, and the read would refuse an empty list
const { data: roomMembers, refresh: readRoomMembers } = useQuery(
  () => $trpc.room.readMembersByIds.query({ roomId: room.id, userIds: friends.value.map(({ id }) => id) }),
  { isLazy: true },
);
const memberIdSet = computed(() => new Set((roomMembers.value ?? []).map(({ id }) => id)));
const readFriends = useReadFriends();

onMounted(async () => {
  await readFriends();
  if (friends.value.length > 0) await readRoomMembers();
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
            :disabled="!isInviteSendable"
            :is-pending="checkIsInviteFriendPending(id)"
            :variant="UiButtonVariant.Accent"
            @click="sendInvite(id)"
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
