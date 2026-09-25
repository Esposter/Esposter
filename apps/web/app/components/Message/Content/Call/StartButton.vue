<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";
import { RoutePath } from "@esposter/shared";

const callStore = useCallStore();
const { createCall } = callStore;
const isCreating = ref(false);
</script>

<template>
  <UiButton
    :is-pending="isCreating"
    :variant="UiButtonVariant.Accent"
    @click="
      async () => {
        isCreating = true;
        const newCallSessionId = await createCall();
        isCreating = false;
        if (newCallSessionId) await navigateTo(RoutePath.Calls(newCallSessionId));
      }
    "
  >
    <UiIcon v-if="!isCreating" :meaning="UiIconMeaning.Camera" />
    New call
  </UiButton>
</template>
