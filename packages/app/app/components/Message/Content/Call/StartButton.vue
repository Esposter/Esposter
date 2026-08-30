<script setup lang="ts">
import type { VBtn } from "vuetify/components";

import { useCallStore } from "@/store/message/room/call";
import { RoutePath } from "@esposter/shared";

const callStore = useCallStore();
const { createCall } = callStore;
const isCreating = ref(false);
const buttonProps = computed<VBtn["$props"]>(() => ({
  loading: isCreating.value,
  prependIcon: "mdi-video-plus",
  text: "New call",
}));
</script>

<template>
  <v-tooltip text="Start a new call">
    <template #activator="{ props }">
      <StyledButton
        :="props"
        :button-props
        @click="
          async () => {
            isCreating = true;
            const newCallSessionId = await createCall();
            isCreating = false;
            if (newCallSessionId) await navigateTo(RoutePath.Calls(newCallSessionId));
          }
        "
      />
    </template>
  </v-tooltip>
</template>
