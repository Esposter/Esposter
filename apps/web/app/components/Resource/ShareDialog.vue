<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Resource } from "@esposter/db-schema";

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
const { executeMutation } = useMutation();
const roomItems = ref<SelectItemCategoryDefinition<string>[]>([]);
const isLoadingRooms = ref(true);
const roomId = ref("");
const note = ref("");
const { origin } = useRequestURL();
const shareMessage = computed(() =>
  getShareMessage(note.value, `${origin}${RoutePath.View(resource.type, resource.id)}`),
);
const cardProps = computed(() => ({ prependIcon: "mdi-share-variant", title: `Share "${resource.name}"` }));
const confirmButtonAttrs = computed(() => ({ disabled: !roomId.value }));
const noteRules = computed(() => [
  () =>
    shareMessage.value.length <= MESSAGE_MAX_LENGTH ||
    "The note and link together exceed the message limit, so the note needs to be shorter",
]);
// The caller mounts this only while open, so the rooms are read once per open rather than watched
onMounted(async () => {
  await getResultAsync(async () => {
    const { items } = await $trpc.room.readRooms.query({ limit: MAX_READ_LIMIT });
    roomItems.value = items.map(({ id, name }) => ({ title: name, value: id }));
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
  <StyledFormDialog
    v-model="isOpen"
    :card-props
    :confirm-button-attrs
    :confirm-button-props="{ text: 'Share' }"
    @submit="
      async (_event, onComplete) => {
        await share();
        onComplete();
      }
    "
  >
    <StyledSkeleton v-if="isLoadingRooms" type="list-item-two-line" />
    <!-- Nothing to pick from is a reason to go make a room, not a disabled button with no explanation -->
    <StyledEmptyState
      v-else-if="roomItems.length === 0"
      icon="mdi-forum-outline"
      title="You're not in any rooms yet"
      description="Join or create a room in esbabbler and the public link can go straight there."
    >
      <v-btn :to="RoutePath.MessagesIndex" prepend-icon="mdi-open-in-new" variant="tonal">Go to esbabbler</v-btn>
    </StyledEmptyState>
    <div v-else flex flex-col gap-2>
      <v-select v-model="roomId" autofocus label="Room" :items="roomItems" />
      <v-textarea v-model="note" :counter="MESSAGE_MAX_LENGTH" label="Message (optional)" rows="3" :rules="noteRules" />
      <span text-hint>The public link is posted as your own message in the room.</span>
    </div>
  </StyledFormDialog>
</template>
