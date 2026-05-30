<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { useRoomStore } from "@/store/message/room";
import { withFinalizerAsync } from "@esposter/shared";

interface EditRoomImageFieldProps {
  image: RoomInMessage["image"];
  name: NonNullable<RoomInMessage["name"]>;
  roomId: RoomInMessage["id"];
}

const { image, name, roomId } = defineProps<EditRoomImageFieldProps>();
const { $trpc } = useNuxtApp();
const { storeUpdateRoom } = useRoomStore();
const input = useTemplateRef("input");
const isLoading = ref(false);
const openFilePicker = () => {
  input.value?.click();
};
const updateImage = async (event: Event) => {
  const target = event.target;
  if (!(target instanceof window.HTMLInputElement)) return;
  const file = target.files?.[0];
  if (!file || file.size > MAX_FILE_REQUEST_SIZE) return;
  isLoading.value = true;
  await withFinalizerAsync(
    async () => {
      const { publicUrl, sasUrl } = await $trpc.room.generateProfileImageUploadUrl.mutate({ roomId });
      await uploadBlocks(file, sasUrl);
      storeUpdateRoom(await $trpc.room.updateRoom.mutate({ id: roomId, image: publicUrl }));
    },
    () => {
      isLoading.value = false;
      target.value = "";
    },
  );
};
</script>

<template>
  <div flex justify-center>
    <div cursor-pointer relative @click="openFilePicker()">
      <v-avatar color="background" size="7rem" :class="{ 'op-50': isLoading }">
        <v-img v-if="image" :src="image" :alt="name" cover />
        <v-icon v-else icon="mdi-account-multiple" size="3rem" />
      </v-avatar>
      <div v-if="isLoading" flex items-center inset-0 justify-center absolute>
        <v-progress-circular color="primary" indeterminate />
      </div>
      <v-tooltip text="Edit Room Image">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            bg-surface
            right-0
            top-0
            absolute
            icon="mdi-pencil"
            size="small"
            type="button"
            :="tooltipProps"
            @click.stop="openFilePicker()"
          />
        </template>
      </v-tooltip>
      <input ref="input" type="file" accept="image/*" hidden @change="updateImage($event)" />
    </div>
  </div>
</template>
