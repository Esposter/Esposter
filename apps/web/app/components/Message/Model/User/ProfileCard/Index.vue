<script setup lang="ts">
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { MemberDialogType } from "#src/models/message/user/MemberDialogType";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useRoomStore } from "#src/store/message/room/index";
import { useRoleStore } from "#src/store/message/room/role";
import { useFriendStore } from "#src/store/message/user/friend";
import { useFriendRequestStore } from "#src/store/message/user/friendRequest";
import { useStatusStore } from "#src/store/message/user/status";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

interface Props {
  user: Pick<MemberInRoom, "displayName" | "id" | "image" | "name">;
}

const { user } = defineProps<Props>();
const emit = defineEmits<{ "open:dialog": [type: MemberDialogType] }>();
const { $trpc } = useNuxtApp();
const { data: session } = await useAuthSession();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const { readMemberRoles } = roleStore;
const statusStore = useStatusStore();
const { getStatusMessage, getUserStatus } = statusStore;
const friendStore = useFriendStore();
const { checkIsFriend } = friendStore;
const friendRequestStore = useFriendRequestStore();
const { checkHasSentFriendRequest } = friendRequestStore;
const isSelf = computed(() => session.value?.user.id === user.id);
const isFriend = computed(() => checkIsFriend(user.id));
const hasSentFriendRequest = computed(() => checkHasSentFriendRequest(user.id));
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
</script>

<template>
  <div w="[min(18rem,80dvw)]" flex flex-col gap-3>
    <div flex gap-2 items-start>
      <MessageModelMemberStatusAvatar :id="user.id" :image="user.image" :name="user.displayName" is-large />
      <div flex-1 />
      <MessageModelUserProfileCardActions :is-self :user @open:dialog="(type) => emit('open:dialog', type)" />
    </div>
    <div flex flex-col>
      <h2 truncate ui-heading>{{ user.displayName }}</h2>
      <p text-muted>{{ getStatusMessage(user.id) || getUserStatus(user.id) }}</p>
    </div>
    <template v-if="!isSelf">
      <div v-if="isFriend">
        <UiChip :meaning="UiIconMeaning.Success">Friends</UiChip>
      </div>
      <div v-else-if="hasSentFriendRequest">
        <UiChip :meaning="UiIconMeaning.Awaiting">Request sent</UiChip>
      </div>
    </template>
    <MessageModelUserProfileCardRoles v-if="currentRoomId" :room-id="currentRoomId" :user-id="user.id" />
    <MessageModelUserProfileCardMutualRooms v-if="!isSelf && mutualRooms && mutualRooms.length > 0" :mutual-rooms />
  </div>
</template>
