<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isHandRaised } = storeToRefs(callStore);
const { toggleHandRaised } = callStore;
</script>

<template>
  <MessageContentCallControlActionButton
    :meaning="UiIconMeaning.RaiseHand"
    :label="isHandRaised ? 'Lower Hand' : 'Raise Hand'"
    :variant="isHandRaised ? UiButtonVariant.Accent : undefined"
    @click="toggleHandRaised()"
  />
</template>
