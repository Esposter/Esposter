<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
  <div
    v-if="isOpen && !callRoomId"
    class="invite"
    m-4
    p-3
    flex
    flex-col
    gap-2
    max-w="[min(20rem,calc(100%-2rem))]"
    bottom-16
    left-0
    absolute
    ui-lifted
  >
    <div flex gap-2 items-center>
      <h2 flex-1 ui-heading>Your call's ready</h2>
      <UiIconButton
        label="Close"
        :meaning="UiIconMeaning.Close"
        :variant="UiButtonVariant.Quiet"
        @click="isOpen = false"
      />
    </div>
    <p text-muted>Share this call link with others you want in the call.</p>
    <div pl-2 flex gap-2 items-center ui-field>
      <span text-sm flex-1 min-w-0 truncate>{{ callLink }}</span>
      <UiCopyButton :source="callLink" />
    </div>
  </div>
</template>

<style scoped>
/* It rises into place once the call is up */
.invite {
  transition:
    opacity var(--ui-motion-long),
    transform var(--ui-motion-long);
}

@starting-style {
  .invite {
    opacity: 0;
    transform: translateY(0.5rem);
  }
}
</style>
