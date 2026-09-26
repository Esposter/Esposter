<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { Resource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getShareMessage } from "@/services/resource/getShareMessage";
import { useNotificationStore } from "@/store/notification";
import { MESSAGE_MAX_LENGTH, NotificationSeverity } from "@esposter/db-schema";
import { getResultAsync, MAX_READ_LIMIT, noop, RoutePath } from "@esposter/shared";

interface Props {
  resource: Resource;
}

const isOpen = defineModel<boolean>({ default: false });
const { resource } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { executeMutation, isPending } = useMutation();
const roomItems = ref<UiSelectItem<string>[]>([]);
const isLoadingRooms = ref(true);
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
// The caller mounts this only while open, so the rooms are read once per open rather than watched
onMounted(async () => {
  await getResultAsync(async () => {
    const { items } = await $trpc.room.readRooms.query({ limit: MAX_READ_LIMIT });
    roomItems.value = items.map(({ id, image, name }) => ({ image: image ?? "", title: name, value: id }));
  }).match(noop, createErrorNotification);
  isLoadingRooms.value = false;
});
const share = async () => {
  const room = roomItems.value.find(({ value }) => value === roomId.value);
  if (!room) return;
  // The caller's own message in their own room — RBAC, rate limits and the message pipeline apply unchanged
  await executeMutation(
    () => $trpc.message.createMessage.mutate({ message: shareMessage.value, roomId: roomId.value }),
    {
      key: Symbol("shareResource"),
      onError: createErrorNotification,
      onSuccess: () => {
        createNotification({
          action: { title: "Open room", to: RoutePath.Messages(room.value) },
          severity: NotificationSeverity.Success,
          title: `Shared to ${room.title}`,
        });
        isOpen.value = false;
      },
    },
  );
};
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Share “${resource.name}”`"
    w="[min(36rem,90vw)]"
  >
    <div v-if="isLoadingRooms" p-3 flex flex-col gap-2>
      <UiSkeleton h-8 />
      <UiSkeleton h-20 />
    </div>
    <!-- Nothing to pick from is a reason to go make a room, not a disabled button with no explanation -->
    <UiEmptyState
      v-else-if="roomItems.length === 0"
      description="Join or create a room in esbabbler and the public link can go straight there."
      :meaning="UiIconMeaning.Comment"
      title="You're not in any rooms yet"
    >
      <UiButtonLink :to="RoutePath.MessagesIndex">Go to esbabbler</UiButtonLink>
    </UiEmptyState>
    <UiForm v-else v-model:is-valid="isValid" p-3 flex flex-col gap-3 @submit="share()">
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
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!roomId || !isValid" :is-pending type="submit" :variant="UiButtonVariant.Accent">
          Share
        </UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
