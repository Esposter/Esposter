<script setup lang="ts">
import { MAX_CALL_BACKGROUND_SIZE_BYTES, MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
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
  <v-list density="compact">
    <v-list-subheader title="Backgrounds and effects" />
    <div px-3 pb-2 gap-2 grid grid-cols-5>
      <button
        v-for="{ imagePath, title } of CallVirtualBackgroundDefinitions"
        :key="title"
        :aria-label="title"
        :style="{ backgroundImage: imagePath ? `url(${imagePath})` : undefined }"
        b-2
        rd
        b-solid
        bg-surface
        aspect-square
        bg-cover
        bg-center
        :class="selectedVirtualBackground === imagePath ? 'b-primary' : 'b-transparent'"
        @click="emit('select', imagePath)"
      >
        <v-icon v-if="!imagePath" icon="mdi-close" size="small" />
      </button>
      <!-- A slot's delete sits on the tile rather than behind a menu: the picker is the only surface these
        exist on, so there is nowhere else for it to live -->
      <div v-for="callBackground of callBackgrounds" :key="callBackground.slot" relative>
        <button
          aria-label="Uploaded background"
          :style="{ backgroundImage: `url(${callBackground.sasUrl})` }"
          b-2
          rd
          b-solid
          bg-surface
          size-full
          aspect-square
          bg-cover
          bg-center
          :class="
            selectedVirtualBackground === getCallBackgroundSelection(callBackground) ? 'b-primary' : 'b-transparent'
          "
          @click="emit('select', getCallBackgroundSelection(callBackground))"
        />
        <StyledTooltipIconButton
          :button-props="{ density: 'compact', size: 'x-small', variant: 'flat' }"
          icon="mdi-close"
          right--2
          top--2
          absolute
          text="Delete Background"
          @click="deleteCallBackground(callBackground.slot)"
        />
      </div>
      <button
        v-if="callBackgrounds.length < MAX_CALL_BACKGROUNDS"
        aria-label="Upload Background"
        b-border
        b-2
        rd
        b-dashed
        bg-surface
        aspect-square
        :disabled="isUploadingCallBackground"
        @click="input?.click()"
      >
        <v-progress-circular v-if="isUploadingCallBackground" indeterminate size="1.25rem" />
        <v-icon v-else icon="mdi-plus" size="small" />
      </button>
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
  </v-list>
</template>
