<script setup lang="ts">
import { DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE } from "@/services/message/room/call/constants";
import { useMediaStore } from "@/store/message/room/call/media";

interface Props {
  participantId: string;
}

const { participantId } = defineProps<Props>();
const mediaStore = useMediaStore();
const { participantVolumePercentageMap } = storeToRefs(mediaStore);
const { setParticipantVolumePercentage } = mediaStore;
const volumePercentage = computed({
  get: () => participantVolumePercentageMap.value.get(participantId) ?? DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE,
  set: (newVolumePercentage) => {
    setParticipantVolumePercentage(participantId, newVolumePercentage);
  },
});
</script>

<template>
  <div px-4 py-2 min-w-56>
    <MessageModelUserSettingsTypeVoiceVolumeSlider v-model="volumePercentage" label="User Volume" />
  </div>
</template>
