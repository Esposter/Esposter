<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  knocker: CallParticipant;
}

const { knocker } = defineProps<Props>();
const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const knockerStore = useKnockerStore();
const { admitKnocker, dismissKnocker } = knockerStore;
const isAdmitting = ref(false);
const isDismissing = ref(false);
// The pending flag clears whichever way the call ends, so a failed admit does not leave its spinner running
const getKnockerAction = (isRunning: Ref<boolean>, action: (callSessionId: string) => Promise<void>) => async () => {
  const callSessionId = activeCallSessionId.value;
  if (!callSessionId) return;
  isRunning.value = true;
  await withFinalizerAsync(
    async () => {
      await action(callSessionId);
    },
    () => {
      isRunning.value = false;
    },
  );
};
// Bound here rather than in the template, where a ref is already unwrapped and the flag would arrive as a
// Boolean the helper cannot set
const admitCallKnocker = getKnockerAction(isAdmitting, (callSessionId) => admitKnocker(callSessionId, knocker.id));
const dismissCallKnocker = getKnockerAction(isDismissing, (callSessionId) => dismissKnocker(callSessionId, knocker.id));
</script>

<template>
  <div ui-row>
    <UiItemContent :image="knocker.image ?? undefined" :title="`${knocker.name} wants to join`">
      <template #append>
        <UiButton :disabled="isAdmitting" @click="admitCallKnocker()">
          <UiSpinner v-if="isAdmitting" />
          Let in
        </UiButton>
        <UiIconButton
          :disabled="isDismissing"
          label="Dismiss"
          :meaning="UiIconMeaning.Close"
          :variant="UiButtonVariant.Quiet"
          @click="dismissCallKnocker()"
        />
      </template>
    </UiItemContent>
  </div>
</template>
