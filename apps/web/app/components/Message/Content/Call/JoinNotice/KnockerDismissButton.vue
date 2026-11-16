<script setup lang="ts">
import type { CallParticipant } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";
import { useKnockerStore } from "#src/store/message/room/call/knocker";

interface Props {
  knocker: CallParticipant;
}

defineProps<Props>();
const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const knockerStore = useKnockerStore();
const { dismissKnocker } = knockerStore;
</script>

<template>
  <!-- The knocker leaves the list as the dismissal is sent -->
  <UiIconButton
    label="Dismiss"
    :meaning="UiIconMeaning.Close"
    :variant="UiButtonVariant.Quiet"
    @click="activeCallSessionId && dismissKnocker(activeCallSessionId, knocker.id)"
  />
</template>
