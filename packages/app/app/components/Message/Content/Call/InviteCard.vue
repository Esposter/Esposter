<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { callRoomId } = storeToRefs(callStore);
const isOpen = ref(true);
const callLink = ref("");

onMounted(() => {
  callLink.value = window.location.href;
});
</script>

<template>
  <StyledCard v-if="isOpen && !callRoomId" m-4 p-4 max-w-80 bottom-16 left-0 absolute>
    <div flex flex-col gap-y-3>
      <div flex items-center justify-between>
        <span font-medium text-body-medium>Your call's ready</span>
        <v-tooltip text="Close">
          <template #activator="{ props }">
            <v-btn :="props" icon="mdi-close" size="small" variant="plain" @click="isOpen = false" />
          </template>
        </v-tooltip>
      </div>
      <span op-medium-emphasis text-body-small>Share this call link with others you want in the call.</span>
      <div px-3 py-2 rd bg-background flex gap-x-2 items-center>
        <span truncate text-body-small>{{ callLink }}</span>
        <StyledClipboardIconButton :source="callLink" text="Copy call link" />
      </div>
    </div>
  </StyledCard>
</template>
