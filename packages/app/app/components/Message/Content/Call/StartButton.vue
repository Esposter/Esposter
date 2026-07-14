<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

const callStore = useCallStore();
const { createCall } = callStore;
const isCreating = ref(false);
</script>

<template>
  <v-tooltip text="Start a new call">
    <template #activator="{ props }">
      <StyledButton
        :="props"
        :button-props="{ loading: isCreating, prependIcon: 'mdi-video-plus', text: 'New call' }"
        @click="
          async () => {
            isCreating = true;
            await withFinalizerAsync(
              async () => {
                const newCallSessionId = await createCall();
                if (!newCallSessionId) return;
                await navigateTo(RoutePath.Calls(newCallSessionId));
              },
              () => {
                isCreating = false;
              },
            );
          }
        "
      />
    </template>
  </v-tooltip>
</template>
