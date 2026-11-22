<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useDirectMessageStore } from "#src/store/message/room/directMessage";
import { useOverlayStore } from "#src/store/overlay";

interface Props {
  roomId: RoomInMessage["id"];
}

const isOpen = defineModel<boolean>({ default: false });
const { roomId } = defineProps<Props>();
const { data: session } = await useAuthSession();
const { $trpc } = useNuxtApp();
const overlayStore = useOverlayStore();
const { writeAwaited } = overlayStore;
const directMessageStore = useDirectMessageStore();
const { getDirectMessageParticipants } = directMessageStore;
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
const excludedUserIds = computed(() => {
  const userIds: string[] = [];
  if (session.value) userIds.push(session.value.user.id);
  userIds.push(...getDirectMessageParticipants(roomId).map(({ id }) => id));
  return userIds;
});
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :awaited-because="AwaitedReason.ServerDecidedOutcome"
    confirm-label="Add"
    :is-confirm-disabled="selectedUserIds.length === 0 || undefined"
    title="Add People"
    :submit="
      async () => {
        // The server may refuse the add, so the picked friends stay in the dialog until it is kept, and the picker
        // Clears only then
        const isAdded = await writeAwaited(
          async () => {
            // A join is announced to the room's members and to each joiner's tabs, so the added participants arrive
            // As their join events, and the answer names nothing to arrive
            await $trpc.room.directMessage.createDirectMessageParticipants.mutate({ roomId, userIds: selectedUserIds });
            return [];
          },
          { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
        );
        if (isAdded) {
          selectedUserIds = [];
          friendPicker?.reset();
        }
        return isAdded;
      }
    "
  >
    <MessageModelRoomDirectMessageFriendPicker
      ref="friendPicker"
      v-model="selectedUserIds"
      :excluded-user-ids
      is-multiple
    />
  </StyledFormDialog>
</template>
