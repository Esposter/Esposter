<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { withFinalizerAsync } from "@esposter/shared";
import { mergeProps } from "vue";

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
  <div flex flex-col gap-y-3 items-center>
    <div flex justify-center>
      <v-hover>
        <template #default="{ isHovering, props: hoverProps }">
          <v-tooltip text="Upload Image">
            <template #activator="{ props: tooltipProps }">
              <button
                p-0
                b-0
                bg-transparent
                relative
                type="button"
                :disabled="isLoading"
                :op-high-emphasis="!isLoading && !isHovering ? '' : undefined"
                :op-loading="isLoading ? '' : undefined"
                :="mergeProps(hoverProps, tooltipProps)"
                @click="input?.click()"
              >
                <v-avatar color="background" size="7rem">
                  <v-img v-if="image" :src="image" :alt="name" cover />
                  <v-icon v-else icon="mdi-account-multiple" size="3rem" />
                </v-avatar>
                <div v-if="isLoading" flex items-center inset-0 justify-center absolute>
                  <v-progress-circular indeterminate />
                </div>
                <v-avatar b-4 b-background b-solid bg-surface right--1 top--1 absolute size="2.5rem">
                  <v-icon icon="mdi-pencil" size="1.25rem" />
                </v-avatar>
              </button>
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
        </template>
      </v-hover>
    </div>
    <button
      v-if="image"
      text-error
      font-bold
      type="button"
      :disabled="isLoading"
      :op-loading="isLoading ? '' : undefined"
      hover:underline
      @click="
        async () => {
          if (!image || isLoading) return;
          isLoading = true;
          await withFinalizerAsync(
            async () => {
              await $trpc.room.deleteProfileImage.mutate({ roomId });
            },
            () => {
              isLoading = false;
            },
          );
        }
      "
    >
      Remove Image
    </button>
  </div>
</template>
