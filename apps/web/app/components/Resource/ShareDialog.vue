<script setup lang="ts">
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";
import type { ResourceInResource } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getShareMessage } from "#src/services/resource/getShareMessage";
import { useNotificationStore } from "#src/store/notification";
import { MESSAGE_MAX_LENGTH, NotificationSeverity } from "@esposter/db-schema";
import { getResultAsync, MAX_READ_LIMIT, RoutePath } from "@esposter/shared";

interface Props {
  resource: ResourceInResource;
}

const isOpen = defineModel<boolean>({ default: false });
const { resource } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { answer, isPending } = useDialogAnswer(isOpen);
// The caller mounts this only while open, so the rooms are read once per open rather than watched
const {
  data: rooms,
  error: roomsError,
  isPending: isLoadingRooms,
  refresh: refreshRooms,
} = useQuery(() => $trpc.room.readRooms.query({ limit: MAX_READ_LIMIT }), { isInlineError: true });
const roomItems = computed<UiSelectItem<string>[]>(() =>
  (rooms.value?.items ?? []).map(({ id, image, name }) => ({ image: image ?? "", title: name, value: id })),
);
const roomId = ref("");
const note = ref("");
const { origin } = useRequestURL();
const shareMessage = computed(() =>
  getShareMessage(note.value, `${origin}${RoutePath.View(resource.type, resource.id)}`),
);
const isValid = ref(true);
const noteRules = computed(() => [
  () =>
    shareMessage.value.length <= MESSAGE_MAX_LENGTH ||
    "The note and link together exceed the message limit, so the note needs to be shorter",
]);
// The message is the room's to accept, so the notice shows once the server has accepted it, and a refused share shows its error
const share = () => {
  const room = roomItems.value.find(({ value }) => value === roomId.value);
  if (!room) return;
  // The caller's own message in their own room — RBAC, rate limits and the message pipeline apply unchanged
  return getResultAsync(() =>
    $trpc.message.createMessage.mutate({
      message: shareMessage.value,
      roomId: roomId.value,
      timeZone: Temporal.Now.timeZoneId(),
    }),
  ).match(() => {
    createNotification({
      action: { title: "Open room", to: RoutePath.Messages(room.value) },
      severity: NotificationSeverity.Success,
      title: `Shared to ${room.title}`,
    });
  }, createErrorNotification);
};
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Share “${resource.name}”`"
    :size="UiDialogSize.Medium"
  >
    <template #default="{ formId }">
      <div v-if="isLoadingRooms" flex flex-col gap-2>
        <UiSkeleton h-8 />
        <UiSkeleton h-20 />
      </div>
      <UiErrorState v-else-if="roomsError" :error="roomsError" @retry="refreshRooms()" />
      <!-- Nothing to pick from is a reason to go make a room, not a disabled button with no explanation -->
      <UiEmptyState
        v-else-if="roomItems.length === 0"
        description="Join or create a room in esbabbler and the public link can go straight there."
        :meaning="UiIconMeaning.Comment"
        title="You're not in any rooms yet"
      >
        <UiButtonLink :to="RoutePath.MessagesIndex">Go to esbabbler</UiButtonLink>
      </UiEmptyState>
      <UiForm v-else :id="formId" v-model:is-valid="isValid" flex flex-col gap-3 @submit="answer(share)">
        <div flex flex-col gap-1>
          <span text-muted>Room</span>
          <UiSelect v-model="roomId" :items="roomItems" label="Room" />
        </div>
        <UiTextField
          v-model="note"
          :counter="MESSAGE_MAX_LENGTH"
          label="Message (optional)"
          :rows="3"
          :rules="noteRules"
        />
        <p text-muted>The public link is posted as your own message in the room.</p>
      </UiForm>
    </template>
    <template v-if="!isLoadingRooms && roomItems.length > 0" #footer="{ formId }">
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="!roomId || !isValid"
        :form="formId"
        :is-pending
        type="submit"
        :variant="UiButtonVariant.Accent"
      >
        Share
      </UiButton>
    </template>
  </UiDialog>
</template>
