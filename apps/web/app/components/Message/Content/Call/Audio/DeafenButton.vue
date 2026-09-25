<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";

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
