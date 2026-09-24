<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useScrollStore } from "@/store/message/ui/scroll";

const scrollStore = useScrollStore();
const { isViewingOlderMessages } = storeToRefs(scrollStore);
const { jumpToPresent } = scrollStore;
</script>

<template>
  <!-- It stays for as long as the list is in the past, since it reports where the reader is rather than something that
    Happened, and it sits at the foot of the list rather than in the toast corner: the present is what it points back
    To, so it rises from the end the list is scrolled away from -->
  <Transition name="rise">
    <div
      v-if="isViewingOlderMessages"
      role="status"
      mx-a
      py-1
      pl-3
      pr-1
      flex
      gap-3
      w-fit
      items-center
      inset-x-4
      bottom-3
      absolute
      z-1
      ui-lifted
    >
      <span truncate>You're viewing older messages</span>
      <UiButton :variant="UiButtonVariant.Accent" @click="jumpToPresent">Jump to present</UiButton>
    </div>
  </Transition>
</template>

<style scoped>
.rise-enter-active {
  transition:
    opacity var(--ui-motion-medium),
    translate var(--ui-motion-medium);
}

.rise-leave-active {
  transition:
    opacity var(--ui-motion-short),
    translate var(--ui-motion-short);
}

.rise-enter-from,
.rise-leave-to {
  opacity: 0;
  translate: 0 calc(var(--ui-step) * 4);
}
</style>
