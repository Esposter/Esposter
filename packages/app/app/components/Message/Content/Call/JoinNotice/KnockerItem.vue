<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { VBtn } from "vuetify/components";

import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { withFinalizerAsync } from "@esposter/shared";

interface KnockerItemProps {
  knocker: CallParticipant;
}

const { knocker } = defineProps<KnockerItemProps>();
const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const knockerStore = useKnockerStore();
const { admitKnocker, dismissKnocker } = knockerStore;
const isAdmitting = ref(false);
const isDismissing = ref(false);
// Both actions need the same three steps around their one call — resolve the session, refuse without one, and
// Clear the button's loading flag whichever way the call ends. Written per button, the finalizer is what gets
// Dropped, and a failed admit then leaves its spinner running until the notice is dismissed
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
// Bound here rather than in the template: a ref read from there is already unwrapped, so the flag would arrive
// As the boolean it held at that render and the helper would have nothing to set
const admitCallKnocker = getKnockerAction(isAdmitting, (callSessionId) => admitKnocker(callSessionId, knocker.id));
const dismissCallKnocker = getKnockerAction(isDismissing, (callSessionId) => dismissKnocker(callSessionId, knocker.id));
const admitButtonProps = computed<VBtn["$props"]>(() => ({
  icon: "mdi-check",
  loading: isAdmitting.value,
  size: "small",
  variant: "tonal",
}));
const dismissButtonProps = computed<VBtn["$props"]>(() => ({
  loading: isDismissing.value,
  size: "small",
  variant: "plain",
}));
</script>

<template>
  <div flex gap-x-3 items-center>
    <StyledAvatar :image="knocker.image" :name="knocker.name" />
    <span font-medium flex-1 truncate text-body-medium>{{ knocker.name }} wants to join</span>
    <v-tooltip text="Let in">
      <template #activator="{ props: tooltipProps }">
        <StyledButton :="tooltipProps" :button-props="admitButtonProps" @click="admitCallKnocker" />
      </template>
    </v-tooltip>
    <StyledTooltipIconButton
      :button-props="dismissButtonProps"
      icon="mdi-close"
      text="Dismiss"
      @click="dismissCallKnocker"
    />
  </div>
</template>
