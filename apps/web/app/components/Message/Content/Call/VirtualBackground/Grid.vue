<script setup lang="ts">
import { MAX_CALL_BACKGROUND_SIZE_BYTES, MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { CallVirtualBackgroundDefinitions } from "@/services/message/room/call/CallVirtualBackgroundDefinitions";
import { getCallBackgroundSelection } from "@/services/message/room/call/getCallBackgroundSelection";
import { useCallBackgroundStore } from "@/store/message/user/settings/callBackground";

interface Props {
  selectedVirtualBackground: string;
}

const { selectedVirtualBackground } = defineProps<Props>();
const emit = defineEmits<{ select: [virtualBackground: string] }>();
const callBackgroundStore = useCallBackgroundStore();
const { createCallBackground, deleteCallBackground, readCallBackgrounds } = callBackgroundStore;
const { callBackgrounds, isUploadingCallBackground } = storeToRefs(callBackgroundStore);
const input = useTemplateRef("input");
const validateFile = useValidateFile();

onMounted(async () => {
  await readCallBackgrounds();
});
</script>

<template>
  <!-- Each background is a picture picked as a whole, the one in use ringed in the accent -->
  <div role="group" aria-label="Backgrounds and effects" flex flex-col gap-1>
    <p text-sm text-muted px-2>Backgrounds and effects</p>
    <div gap-2 grid cols-3>
      <UiTooltip
        v-for="{ imagePath, title } of CallVirtualBackgroundDefinitions"
        :key="title"
        #default="{ activatorProps }"
        :label="title"
      >
        <button
          :="activatorProps"
          :aria-label="title"
          :aria-pressed="selectedVirtualBackground === imagePath"
          :style="{ backgroundImage: imagePath ? `url(${imagePath})` : undefined }"
          type="button"
          class="aria-pressed:shadow-[0_0_0_var(--ui-indicator-width)_var(--ui-accent)]"
          flex
          aspect-square
          cursor-pointer
          items-center
          justify-center
          bg-cover
          bg-center
          ui-field
          @click="emit('select', imagePath)"
        >
          <UiIcon v-if="!imagePath" :meaning="UiIconMeaning.None" />
        </button>
      </UiTooltip>
      <!-- A slot's delete sits on the tile rather than behind a menu: the picker is the only surface these
        exist on, so there is nowhere else for it to live -->
      <div v-for="callBackground of callBackgrounds" :key="callBackground.slot" relative>
        <UiTooltip #default="{ activatorProps }" label="Uploaded background">
          <button
            :="activatorProps"
            aria-label="Uploaded background"
            :aria-pressed="selectedVirtualBackground === getCallBackgroundSelection(callBackground)"
            :style="{ backgroundImage: `url(${callBackground.sasUrl})` }"
            type="button"
            class="aria-pressed:shadow-[0_0_0_var(--ui-indicator-width)_var(--ui-accent)]"
            size-full
            aspect-square
            cursor-pointer
            bg-cover
            bg-center
            ui-field
            @click="emit('select', getCallBackgroundSelection(callBackground))"
          />
        </UiTooltip>
        <UiIconButton
          label="Delete Background"
          :meaning="UiIconMeaning.Delete"
          right-1
          top-1
          absolute
          @click="deleteCallBackground(callBackground.slot)"
        />
      </div>
      <UiTooltip
        v-if="callBackgrounds.length < MAX_CALL_BACKGROUNDS"
        #default="{ activatorProps }"
        label="Upload Background"
      >
        <button
          :="activatorProps"
          aria-label="Upload Background"
          type="button"
          :disabled="isUploadingCallBackground"
          flex
          aspect-square
          cursor-pointer
          items-center
          justify-center
          ui-field
          disabled:cursor-default
          @click="input?.click()"
        >
          <UiSpinner v-if="isUploadingCallBackground" />
          <UiIcon v-else :meaning="UiIconMeaning.Upload" />
        </button>
      </UiTooltip>
      <!-- The tile above is the labelled upload affordance, so this proxy input stays out of the
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
            if (input) input.value = '';
            if (!file) return;
            if (!validateFile(file, MAX_CALL_BACKGROUND_SIZE_BYTES)) return;

            await createCallBackground(file);
          }
        "
      />
    </div>
  </div>
</template>
