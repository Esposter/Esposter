<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";
import { mergeProps } from "vue";

interface Props {
  name: NonNullable<RoomInMessage["name"]>;
  roomId: RoomInMessage["id"];
}

const modelValue = defineModel<RoomInMessage["image"]>({ required: true });
const { name, roomId } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const validateFile = useValidateFile();
const input = useTemplateRef("input");
const { isLoading, uploadImage } = useUploadImage(() => $trpc.room.generateProfileImageUploadUrl.mutate({ roomId }));
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
                  <NuxtImg v-if="modelValue" size-full object-cover :src="modelValue" :alt="name" />
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
          <!-- The button above is the labelled upload affordance, so this proxy input stays out of the
            accessibility tree and out of the tab order -->
          <input
            ref="input"
            type="file"
            accept="image/*"
            aria-hidden="true"
            tabindex="-1"
            hidden
            @change="
              async (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (!file) return;

                if (!validateFile(file)) return;

                await getResultAsync(() =>
                  uploadImage(file, () => {
                    if (input) input.value = '';
                  }),
                ).match((newImage) => {
                  modelValue = newImage;
                }, createErrorAlert);
              }
            "
          />
        </template>
      </v-hover>
    </div>
    <button
      v-if="modelValue"
      text-error
      font-bold
      type="button"
      :disabled="isLoading"
      hover:underline
      @click="modelValue = ''"
    >
      Remove Image
    </button>
  </div>
</template>
