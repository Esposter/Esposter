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
      await router.push({ path: RoutePath.Calls(newCallSessionId), query: { direct: "1" } });
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
      <v-btn
        :="props"
        :loading="isCreating"
        color="primary"
        prepend-icon="mdi-video-plus"
        text="New call"
        variant="tonal"
        @click="startCall()"
      />
    </template>
  </v-tooltip>
</template>
