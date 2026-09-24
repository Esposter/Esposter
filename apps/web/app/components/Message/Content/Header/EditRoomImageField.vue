<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";

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

<!-- The room's picture is the button that replaces it, marked with a pencil on its corner -->
<template>
  <div flex flex-col gap-2 items-center>
    <UiTooltip #default="{ activatorProps }" label="Upload Image">
      <button
        :="activatorProps"
        aria-label="Upload Image"
        type="button"
        :disabled="isLoading"
        class="group"
        cursor-pointer
        relative
        disabled:cursor-default
        @click="input?.click()"
      >
        <UiAvatar :image="modelValue" :name is-large group-hover:op-80 />
        <span v-if="isLoading" flex items-center inset-0 justify-center absolute>
          <UiSpinner />
        </span>
        <span p-1 flex right--1 top--1 absolute ui-raised ui-pill>
          <UiIcon :meaning="UiIconMeaning.Edit" />
        </span>
      </button>
    </UiTooltip>
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
    <UiButton v-if="modelValue" :disabled="isLoading" :variant="UiButtonVariant.Quiet" @click="modelValue = ''">
      Remove Image
    </UiButton>
  </div>
</template>
