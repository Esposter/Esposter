<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";
import { useMediaStore } from "#src/store/message/room/call/media";

const callStore = useCallStore();
const { toggleDeafen } = callStore;
const mediaStore = useMediaStore();
const { isDeafened } = storeToRefs(mediaStore);
</script>

<template>
  <UiIconButton
    :meaning="isDeafened ? UiIconMeaning.Undeafen : UiIconMeaning.Deafen"
    :label="isDeafened ? 'Undeafen' : 'Deafen'"
    :variant="isDeafened ? UiButtonVariant.Danger : undefined"
    @click="toggleDeafen()"
  />
</template>
