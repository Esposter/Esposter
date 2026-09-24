<script setup lang="ts">
import { DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE } from "@/services/message/room/call/constants";
import { useMediaStore } from "@/store/message/room/call/media";
import { MAX_USER_VOLUME_PERCENTAGE } from "@esposter/db-schema";

interface Props {
  participantId: string;
}

const { participantId } = defineProps<Props>();
const mediaStore = useMediaStore();
const { participantVolumePercentageMap } = storeToRefs(mediaStore);
const { setParticipantVolumePercentage } = mediaStore;
// Heard at every move of the thumb and kept for the call alone, so there is nothing to save once it settles
const volumePercentage = computed({
  get: () => participantVolumePercentageMap.value.get(participantId) ?? DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE,
  set: (newVolumePercentage) => {
    setParticipantVolumePercentage(participantId, newVolumePercentage);
  },
});
</script>

<template>
  <UiSlider
    v-model="volumePercentage"
    label="User Volume"
    :max="MAX_USER_VOLUME_PERCENTAGE"
    :min="0"
    :step="1"
    :value-text="`${volumePercentage}%`"
  />
</template>
