<script setup lang="ts">
import type { CallBackground } from "#shared/models/message/call/CallBackground";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getCallBackgroundSelection } from "#src/services/message/room/call/getCallBackgroundSelection";

interface Props {
  callBackground: CallBackground;
  selectedVirtualBackground: string;
}

const { callBackground } = defineProps<Props>();
const emit = defineEmits<{ delete: [selection: string]; select: [selection: string] }>();
const selection = computed(() => getCallBackgroundSelection(callBackground));
</script>

<template>
  <!-- A slot's delete sits on the tile rather than behind a menu: the picker is the only surface these
    exist on, so there is nowhere else for it to live -->
  <div relative>
    <UiTooltip #default="{ activatorProps }" label="Uploaded background">
      <button
        :="activatorProps"
        aria-label="Uploaded background"
        :aria-pressed="selectedVirtualBackground === selection"
        :style="{ backgroundImage: `url(${callBackground.presignedUrl})` }"
        type="button"
        class="aria-pressed:shadow-[0_0_0_var(--ui-indicator-width)_var(--ui-accent)]"
        size-full
        aspect-square
        cursor-pointer
        bg-cover
        bg-center
        ui-field
        @click="emit('select', selection)"
      />
    </UiTooltip>
    <UiIconButton
      label="Delete Background"
      :meaning="UiIconMeaning.Delete"
      right-1
      top-1
      absolute
      @click="emit('delete', selection)"
    />
  </div>
</template>
