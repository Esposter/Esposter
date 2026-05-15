<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

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
const onAdmit = async () => {
  const callSessionId = activeCallSessionId.value;
  if (!callSessionId) return;
  isAdmitting.value = true;
  await withFinalizerAsync(
    async () => {
      await admitKnocker(callSessionId, knocker.id);
    },
    () => {
      isAdmitting.value = false;
    },
  );
};
const onDismiss = async () => {
  const callSessionId = activeCallSessionId.value;
  if (!callSessionId) return;
  isDismissing.value = true;
  await withFinalizerAsync(
    async () => {
      await dismissKnocker(callSessionId, knocker.id);
    },
    () => {
      isDismissing.value = false;
    },
  );
};
</script>

<template>
  <div flex gap-x-3 items-center>
    <StyledAvatar :image="knocker.image" :name="knocker.name" />
    <span font-medium flex-1 truncate text-body-medium>{{ knocker.name }} wants to join</span>
    <v-tooltip text="Let in">
      <template #activator="{ props: tooltipProps }">
        <StyledButton
          :="tooltipProps"
          :button-props="{ icon: 'mdi-check', loading: isAdmitting, size: 'small', variant: 'tonal' }"
          @click="onAdmit()"
        />
      </template>
    </v-tooltip>
    <v-tooltip text="Dismiss">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          :="tooltipProps"
          :loading="isDismissing"
          icon="mdi-close"
          size="small"
          variant="plain"
          @click="onDismiss()"
        />
      </template>
    </v-tooltip>
  </div>
</template>
