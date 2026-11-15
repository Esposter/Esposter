<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";

const callStore = useCallStore();
const { isHandRaised } = storeToRefs(callStore);
const { toggleHandRaised } = callStore;
</script>

<template>
  <UiIconButton
    :meaning="UiIconMeaning.RaiseHand"
    :label="isHandRaised ? 'Lower Hand' : 'Raise Hand'"
    :variant="isHandRaised ? UiButtonVariant.Accent : undefined"
    @click="toggleHandRaised()"
  />
</template>
