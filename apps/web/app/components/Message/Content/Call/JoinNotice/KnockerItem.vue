<script setup lang="ts">
import type { CallParticipant } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";
import { useKnockerStore } from "#src/store/message/room/call/knocker";
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
// The server decides the admission, so the button is pending until it answers, and clears whichever way it ends so a
// Failed admit does not leave its spinner running
const admitCallKnocker = async () => {
  const callSessionId = activeCallSessionId.value;
  if (!callSessionId) return;
  isAdmitting.value = true;
  await withFinalizerAsync(
    () => admitKnocker(callSessionId, knocker.id),
    () => {
      isAdmitting.value = false;
    },
  );
};
// The knocker leaves the list as the dismissal is sent
const dismissCallKnocker = () => {
  const callSessionId = activeCallSessionId.value;
  if (callSessionId) dismissKnocker(callSessionId, knocker.id);
};
</script>

<template>
  <div ui-row>
    <UiItemContent :image="knocker.image ?? undefined" :title="`${knocker.name} wants to join`">
      <template #append>
        <UiButton :is-pending="isAdmitting" @click="admitCallKnocker()"> Let in </UiButton>
        <UiIconButton
          label="Dismiss"
          :meaning="UiIconMeaning.Close"
          :variant="UiButtonVariant.Quiet"
          @click="dismissCallKnocker()"
        />
      </template>
    </UiItemContent>
  </div>
</template>
