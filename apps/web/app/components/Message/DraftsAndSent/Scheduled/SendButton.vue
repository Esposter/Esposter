<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";

interface Props {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { sendScheduledMessageNow } = scheduledMessageJobStore;
</script>

<!-- A reminder posts nothing, so it has nothing to send now -->
<template>
  <UiIconButton
    :disabled="scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage"
    label="Send message"
    :meaning="UiIconMeaning.Send"
    :variant="UiButtonVariant.Quiet"
    @click="sendScheduledMessageNow(scheduledMessageJob.id)"
  />
</template>
