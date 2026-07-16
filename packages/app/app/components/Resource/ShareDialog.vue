<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Resource } from "@esposter/db-schema";

import { getShareMessage } from "@/services/resource/getShareMessage";
import { useNotificationStore } from "@/store/notification";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { getResultAsync, MAX_READ_LIMIT, noop, RoutePath } from "@esposter/shared";

interface ResourceShareDialogProps {
  resource: Resource;
}

const isOpen = defineModel<boolean>({ default: false });
const { resource } = defineProps<ResourceShareDialogProps>();
const { $trpc } = useNuxtApp();
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
const executeMutation = useMutation();
const rules = useVRules();
const roomItems = ref<SelectItemCategoryDefinition<string>[]>([]);
const isLoadingRooms = ref(true);
const roomId = ref("");
const note = ref("");
const title = computed(() => `Share "${resource.name}"`);
// The caller mounts this only while open, so the rooms are read once per open rather than watched
onMounted(async () => {
  await getResultAsync(async () => {
    const { items } = await $trpc.room.readRooms.query({ limit: MAX_READ_LIMIT });
    roomItems.value = items.map(({ id, name }) => ({ title: name, value: id }));
  }).match(noop, (error) => {
    createNotification({ severity: "error", title: error.message });
  });
  isLoadingRooms.value = false;
});
const share = async () => {
  const room = roomItems.value.find(({ value }) => value === roomId.value);
  if (!room) return;

  const message = getShareMessage(note.value, `${window.location.origin}${RoutePath.View(resource.type, resource.id)}`);
  // The caller's own message in their own room — RBAC, rate limits and the message pipeline apply unchanged
  await executeMutation(() => $trpc.message.createMessage.mutate({ message, roomId: roomId.value }), {
    onError: (error) => {
      createNotification({ severity: "error", title: error.message });
    },
    onSuccess: () => {
      createNotification({
        action: { title: "Open room", to: RoutePath.Messages(room.value) },
        severity: "success",
        title: `Shared to ${room.title}`,
      });
      isOpen.value = false;
    },
  });
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ prependIcon: 'mdi-share-variant', title }"
    :confirm-button-attrs="{ disabled: !roomId }"
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
      <v-btn prepend-icon="mdi-open-in-new" variant="tonal" :to="RoutePath.MessagesIndex">Go to esbabbler</v-btn>
    </StyledEmptyState>
    <div v-else flex flex-col gap-2>
      <v-select v-model="roomId" autofocus label="Room" :items="roomItems" />
      <v-textarea
        v-model="note"
        :counter="MESSAGE_MAX_LENGTH"
        label="Message (optional)"
        rows="3"
        :rules="[rules.maxLength(MESSAGE_MAX_LENGTH)]"
      />
      <span op-medium-emphasis text-caption>The public link is posted as your own message in the room.</span>
    </div>
  </StyledFormDialog>
</template>
