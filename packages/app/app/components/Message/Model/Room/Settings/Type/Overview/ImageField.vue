<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
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
const input = useTemplateRef("input");
const isLoading = ref(false);
</script>

<template>
  <div flex justify-center>
    <div cursor-pointer relative @click="input?.click()">
      <v-avatar size="100" :class="{ 'op-50': isLoading }">
        <v-img v-if="room?.image" :src="room.image" :alt="room.name ?? ''" />
        <v-icon v-else size="48" icon="mdi-account-multiple" />
      </v-avatar>
      <div v-if="isLoading" flex items-center inset-0 justify-center absolute>
        <v-progress-circular indeterminate color="primary" />
      </div>
      <v-btn size="x-small" color="surface-variant" icon bottom-0 right-0 absolute @click.stop="input?.click()">
        <v-icon icon="mdi-pencil" size="small" />
      </v-btn>
      <input
        ref="input"
        type="file"
        accept="image/*"
        hidden
        @change="
          async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file || file.size > MAX_FILE_REQUEST_SIZE) return;
            isLoading = true;
            await withFinalizerAsync(
              async () => {
                const { publicUrl, sasUrl } = await $trpc.room.generateProfileImageUploadUrl.mutate({ roomId });
                await uploadBlocks(file, sasUrl);
                await $trpc.room.updateRoom.mutate({ id: roomId, image: publicUrl });
              },
              () => {
                isLoading = false;
                if (input) input.value = '';
              },
            );
          }
        "
      />
    </div>
  </div>
</template>
