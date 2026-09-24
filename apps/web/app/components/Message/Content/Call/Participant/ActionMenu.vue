<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";

interface Props {
  participant: CallParticipant;
}

// A panel rather than a menu, since it holds the participant's volume, which stays open while it is dragged. What a call
// Site passes goes to the trigger, and the trigger's content is the call site's own where it is more than a mark: the
// Participant's avatar on the call strip
defineSlots<{ trigger?: () => VNode }>();
const { participant } = defineProps<Props>();
const callStore = useCallStore();
const { isInCall } = storeToRefs(callStore);
const { getActions } = useCallParticipantActions();
const actions = computed(() =>
  getActions(participant.id, participant.userId, participant.isMuted, participant.isHandRaised),
);
const actionItems = computed(() =>
  actions.value.map<UiListItem<string>>(({ icon, title }) => ({ icon, title, value: title })),
);
</script>

<template>
  <UiPopover :label="`Options for ${participant.name}`" px-0>
    <template #trigger>
      <slot name="trigger"><UiIcon :meaning="UiIconMeaning.More" /></slot>
    </template>
    <template #default="{ close }">
      <div w="[min(16rem,80dvw)]" flex flex-col gap-2>
        <MessageContentCallParticipantVolumeSlider v-if="isInCall" :participant-id="participant.id" />
        <UiList
          v-if="actionItems.length > 0"
          :items="actionItems"
          label="Actions"
          @select="
            async (title, event) => {
              close();
              await actions.find((action) => action.title === title)?.onClick?.(event);
            }
          "
        />
      </div>
    </template>
  </UiPopover>
</template>
