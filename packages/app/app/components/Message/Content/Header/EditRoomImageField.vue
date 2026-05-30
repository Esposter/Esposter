<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { withFinalizerAsync } from "@esposter/shared";

interface EditRoomImageFieldProps {
  image: RoomInMessage["image"];
  name: NonNullable<RoomInMessage["name"]>;
  roomId: RoomInMessage["id"];
}

const { image, name, roomId } = defineProps<EditRoomImageFieldProps>();
const { $trpc } = useNuxtApp();
const input = useTemplateRef("input");
const isLoading = ref(false);
</script>

<template>
  <div flex justify-center>
    <div cursor-pointer relative @click="input?.click()">
      <v-avatar color="background" size="7rem" :class="{ 'op-50': isLoading }">
        <v-img v-if="image" :src="image" :alt="name" cover />
        <v-icon v-else icon="mdi-account-multiple" size="3rem" />
      </v-avatar>
      <div v-if="isLoading" flex items-center inset-0 justify-center absolute>
        <v-progress-circular color="primary" indeterminate />
      </div>
      <v-tooltip text="Edit Room Image">
        <template #activator="{ props }">
          <v-btn
            bg-surface
            right-0
            top-0
            absolute
            icon="mdi-pencil"
            size="small"
            type="button"
            :="props"
            @click.stop="input?.click()"
          />
        </template>
      </v-tooltip>
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
