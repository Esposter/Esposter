<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

const router = useRouter();
const callStore = useCallStore();
const { createCall } = callStore;
const isCreating = ref(false);
const startCall = async () => {
  isCreating.value = true;
  await withFinalizerAsync(
    async () => {
      const newCallSessionId = await createCall();
      if (!newCallSessionId) return;
      await router.push(RoutePath.Calls(newCallSessionId));
    },
    () => {
      isCreating.value = false;
    },
  );
};
</script>

<template>
  <v-tooltip text="Start a new call">
    <template #activator="{ props }">
      <StyledButton
        :="props"
        :button-props="{ loading: isCreating, prependIcon: 'mdi-video-plus', text: 'New call' }"
        @click="startCall()"
      />
    </template>
  </v-tooltip>
</template>
