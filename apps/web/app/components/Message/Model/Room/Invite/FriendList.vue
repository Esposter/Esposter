<script setup lang="ts">
import type { InviteRecipient } from "@/models/message/room/invite/InviteRecipient";
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { getDirectMessageName } from "@/services/message/room/getDirectMessageName";
import { searchItems } from "@/services/search/searchItems";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useInviteStore } from "@/store/message/room/invite";
import { useFriendStore } from "@/store/message/user/friend";
import { getSynchronizedFunction } from "@esposter/shared";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const directMessageStore = useDirectMessageStore();
const { directMessages } = storeToRefs(directMessageStore);
const {
  checkIsGroupDirectMessage,
  checkIsInviteDirectMessagePending,
  checkIsInviteFriendPending,
  getDirectMessageParticipants,
  inviteDirectMessage,
  inviteFriend,
} = directMessageStore;
const inviteStore = useInviteStore();
const { getUsableInviteLink } = inviteStore;
const { invites } = storeToRefs(inviteStore);
// A paused room has no usable link to send, and the invite the reader holds is the one the send carries
const invite = computed(() => invites.value.get(room.id));
const isInviteSendable = computed(() => Boolean(invite.value) && !room.isInvitePaused);
// The invite can lapse or run out of uses while the dialog is open, so the send rechecks it and mints a fresh one
// Before a link is sent
const sendInvite = async (recipient: InviteRecipient) => {
  const inviteLink = await getUsableInviteLink(room);
  if (!inviteLink) return;
  if (recipient.isGroup) await inviteDirectMessage(recipient.id, inviteLink);
  else await inviteFriend(recipient.id, inviteLink);
};
const checkIsRecipientPending = ({ id, isGroup }: InviteRecipient) =>
  isGroup ? checkIsInviteDirectMessagePending(id) : checkIsInviteFriendPending(id);
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
// A group's recency is its own place in the direct message list, which is the same order a friend's recency is read in
const recipients = computed<InviteRecipient[]>(() => {
  const friendRecipients = friends.value.map(({ id, image, name }) => ({
    id,
    image,
    isGroup: false,
    name,
    recency: getFriendRecency(id),
  }));
  const groupRecipients = directMessages.value.flatMap((directMessage, index) =>
    checkIsGroupDirectMessage(directMessage.id)
      ? [
          {
            id: directMessage.id,
            image: directMessage.image,
            isGroup: true,
            name: getDirectMessageName(directMessage, getDirectMessageParticipants(directMessage.id)),
            recency: index,
          },
        ]
      : [],
  );
  return [...friendRecipients, ...groupRecipients].toSorted(
    (firstRecipient, secondRecipient) => firstRecipient.recency - secondRecipient.recency,
  );
});
const recipientItems = computed(() => searchItems(recipients.value, searchQuery.value, ({ name }) => ({ name })));
// Which friends are already members is read once the friends are, since a member row reads Joined and is disabled. With
// No friends there is nobody to ask about, and the read would refuse an empty list
const { data: roomMembers, refresh: readRoomMembers } = useQuery(
  () => $trpc.room.readMembersByIds.query({ roomId: room.id, userIds: friends.value.map(({ id }) => id) }),
  { isLazy: true },
);
const memberIdSet = computed(() => new Set((roomMembers.value ?? []).map(({ id }) => id)));
// The list shows skeleton rows rather than its empty state while the first read of the friends is on its way
const { isPending: isFriendsPending } = useQuery(useReadFriends(), {
  onSuccess: () => {
    if (friends.value.length > 0) getSynchronizedFunction(readRoomMembers)();
  },
});
</script>

<template>
  <div flex flex-col gap-2>
    <UiTextField v-model="searchQuery" label="Search friends" :type="UiTextFieldType.Search" />
    <ul v-if="recipientItems.length > 0" max-h="[40dvh]" flex flex-col of-y-auto>
      <MessageFriendsUserListItem
        v-for="recipient of recipientItems"
        :key="recipient.id"
        :image="recipient.image"
        :name="recipient.name"
      >
        <template #append>
          <UiButton v-if="memberIdSet.has(recipient.id)" disabled>Joined</UiButton>
          <UiButton
            v-else
            :disabled="!isInviteSendable"
            :is-pending="checkIsRecipientPending(recipient)"
            :variant="UiButtonVariant.Accent"
            @click="sendInvite(recipient)"
          >
            Invite
          </UiButton>
        </template>
      </MessageFriendsUserListItem>
    </ul>
    <ul v-else-if="isFriendsPending" aria-busy="true" flex flex-col>
      <li v-for="i in 3" :key="i" ui-row>
        <UiSkeleton shrink-0 size-6 />
        <UiSkeleton flex-1 h-4 />
      </li>
    </ul>
    <UiEmptyState
      v-else
      :description="searchQuery ? 'No friend or group of yours goes by that name.' : undefined"
      :meaning="UiIconMeaning.Person"
      title="No friends found"
    />
  </div>
</template>
