<script setup lang="ts">
import type { MemberDialogType } from "@/models/message/user/MemberDialogType";
import type { User } from "@esposter/db-schema";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { useModerationNoteStore } from "@/store/message/moderation/note";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { useStatusStore } from "@/store/message/user/status";
import { getResultAsync, noop } from "@esposter/shared";

interface Props {
  user: Pick<User, "id" | "image" | "name">;
}

const { user } = defineProps<Props>();
const emit = defineEmits<{ "open:dialog": [type: MemberDialogType] }>();
const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const { readMemberRoles } = roleStore;
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
const statusStore = useStatusStore();
const { getStatusMessage, getUserStatus } = statusStore;
const friendStore = useFriendStore();
const { checkIsFriend } = friendStore;
const friendRequestStore = useFriendRequestStore();
const { checkHasSentFriendRequest } = friendRequestStore;
const moderationNoteStore = useModerationNoteStore();
const { currentTargetUserId } = storeToRefs(moderationNoteStore);
const isSelf = computed(() => session.value?.user.id === user.id);
// The row this card pops out of already shows the room nickname, so the card has to resolve the same way —
// Otherwise opening a renamed member swaps the name out from under the cursor
const displayName = computed(() => getDisplayName(user, currentRoomId.value));
const { copyUserIdItem, friendItem, isKickable, moderationItems } = useMemberActionItems(
  () => user,
  currentRoomId,
  (type) => {
    emit("open:dialog", type);
  },
);
// Discord leads with adding a stranger or messaging a friend beside the avatar, and keeps the rest under More
const overflowItems = computed(() => [copyUserIdItem, ...moderationItems.value]);
// The card must appear the moment it is opened, so the mutual rooms load behind it rather than blocking setup — the
// Section simply appears once they land
const { data: mutualRooms } = useQuery(() => $trpc.room.readMutualRooms.query({ userId: user.id }));
// The member's roles load behind the card too, and they decide which moderation actions it offers. Nothing awaits
// The read and nobody asked for it, so it reports its own failure — the roles render empty, which is also what a
// Member with no roles looks like
if (currentRoomId.value)
  getSynchronizedFunction(() =>
    getResultAsync(() => readMemberRoles({ roomId: currentRoomId.value, userIds: [user.id] })).match(
      noop,
      console.error,
    ),
  )();
const { readModerationNotes } = useReadModerationNotes(currentRoomId.value, () => user.id);
// The notes action counts them before it is opened, so a moderator who may read them has them read with the card
watchImmediate(isKickable, async (newIsKickable) => {
  if (!newIsKickable) return;
  currentTargetUserId.value = user.id;
  await readModerationNotes();
});
</script>

<template>
  <div w="[min(18rem,80dvw)]" flex flex-col gap-3>
    <div flex gap-2 items-start>
      <MessageModelMemberStatusAvatar :id="user.id" :image="user.image" :name="displayName" is-large />
      <div flex-1 />
      <template v-if="!isSelf">
        <UiButton v-if="friendItem" :variant="UiButtonVariant.Accent" @click="friendItem.onClick?.($event)">
          {{ friendItem.title }}
        </UiButton>
        <UiOverflowMenu :items="overflowItems" :label="`${displayName} actions`" />
      </template>
    </div>
    <div flex flex-col>
      <h2 truncate ui-heading>{{ displayName }}</h2>
      <p text-muted>{{ getStatusMessage(user.id) || getUserStatus(user.id) }}</p>
    </div>
    <template v-if="!isSelf">
      <div v-if="checkIsFriend(user.id)">
        <UiChip :meaning="UiIconMeaning.Success">Friends</UiChip>
      </div>
      <div v-else-if="checkHasSentFriendRequest(user.id)">
        <UiChip :meaning="UiIconMeaning.Awaiting">Request sent</UiChip>
      </div>
    </template>
    <MessageModelUserProfileCardRoles v-if="currentRoomId" :room-id="currentRoomId" :user-id="user.id" />
    <MessageModelUserProfileCardMutualRooms v-if="!isSelf && mutualRooms && mutualRooms.length > 0" :mutual-rooms />
  </div>
</template>
