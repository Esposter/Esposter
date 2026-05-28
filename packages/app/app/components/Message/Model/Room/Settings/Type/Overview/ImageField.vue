<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { useRoomStore } from "@/store/message/room";
import { withFinalizerAsync } from "@esposter/shared";

interface OverviewImageFieldProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<OverviewImageFieldProps>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const room = computed(() => rooms.value.find(({ id }) => id === roomId));
const fileInputRef = ref<HTMLInputElement>();
const isLoading = ref(false);

const upload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || file.size >= MAX_FILE_REQUEST_SIZE) return;
  isLoading.value = true;
  await withFinalizerAsync(
    async () => {
      const { publicUrl, sasUrl } = await $trpc.room.generateProfileImageUploadUrl.mutate({ roomId });
      await uploadBlocks(file, sasUrl);
      await $trpc.room.updateRoom.mutate({ id: roomId, image: publicUrl });
    },
    () => {
      isLoading.value = false;
      if (fileInputRef.value) fileInputRef.value.value = "";
    },
  );
};
</script>

<template>
  <div flex justify-center>
    <div relative cursor-pointer @click="fileInputRef?.click()">
      <v-avatar size="100" :class="{ 'opacity-50': isLoading }">
        <v-img v-if="room?.image" :src="room.image" :alt="room.name ?? ''" />
        <v-icon v-else size="48" icon="mdi-account-multiple" />
      </v-avatar>
      <div v-if="isLoading" absolute inset-0 flex items-center justify-center>
        <v-progress-circular indeterminate color="primary" />
      </div>
      <v-btn
        icon
        size="x-small"
        color="surface-variant"
        class="absolute bottom-0 right-0"
        @click.stop="fileInputRef?.click()"
      >
        <v-icon icon="mdi-pencil" size="small" />
      </v-btn>
      <input ref="fileInputRef" type="file" accept="image/*" hidden @change="upload" />
    </div>
  </div>
</template>
