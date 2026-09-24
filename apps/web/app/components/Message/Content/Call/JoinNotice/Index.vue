<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useParticipantStore } from "@/store/message/room/call/participant";

const knockerStore = useKnockerStore();
const { knockers } = storeToRefs(knockerStore);
const participantStore = useParticipantStore();
const { clearJoinNotice } = participantStore;
const { joinNoticeParticipant } = storeToRefs(participantStore);
</script>

<!-- Floats over the stage's corner, arriving from above as a toast does; who is waiting outranks who just joined -->
<template>
  <section
    v-if="knockers.length > 0"
    class="notice"
    aria-label="Waiting to join"
    role="status"
    p-2
    flex
    flex-col
    max-w="[min(24rem,calc(100%-2rem))]"
    w-full
    right-4
    top-16
    absolute
    ui-lifted
  >
    <h2 text-sm text-muted px-2>Waiting to join</h2>
    <MessageContentCallJoinNoticeKnockerItem v-for="knocker of knockers" :key="knocker.id" :knocker />
  </section>
  <div
    v-else-if="joinNoticeParticipant"
    class="notice"
    role="status"
    p-2
    max-w="[min(24rem,calc(100%-2rem))]"
    right-4
    top-16
    absolute
    ui-lifted
  >
    <div ui-row>
      <UiItemContent
        :image="joinNoticeParticipant.image ?? undefined"
        :title="`${joinNoticeParticipant.name} joined the call`"
      >
        <template #append>
          <UiIconButton
            label="Close"
            :meaning="UiIconMeaning.Close"
            :variant="UiButtonVariant.Quiet"
            @click="clearJoinNotice()"
          />
        </template>
      </UiItemContent>
    </div>
  </div>
</template>

<style scoped>
.notice {
  transition:
    opacity var(--ui-motion-long),
    transform var(--ui-motion-long);
}

@starting-style {
  .notice {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
}
</style>
