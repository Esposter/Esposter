<script setup lang="ts">
import { useMediaStore } from "@/store/message/room/call/media";

interface CallStageProps {
  isDense?: true;
}

const { isDense } = defineProps<CallStageProps>();
const emit = defineEmits<{ fullscreen: [] }>();
const mediaStore = useMediaStore();
const { activeScreenShareStream, hasScreenShare, pinnedParticipantId } = storeToRefs(mediaStore);
const { callParticipantMap, getParticipantTileProps, presenterName } = useCallParticipantTiles();
const isScreenSharePresenting = computed(() => hasScreenShare.value && Boolean(activeScreenShareStream.value));
const callParticipantGridClass = computed(() => {
  if (callParticipantMap.value.size <= 1) return "grid-cols-1";
  if (callParticipantMap.value.size === 2) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
});
</script>

<template>
  <main
    flex
    flex-1
    min-h-0
    min-w-0
    :class="[isDense ? 'p-2 gap-x-2' : 'p-5 gap-x-3', isScreenSharePresenting ? 'flex-row' : 'flex-col']"
  >
    <MessageContentCallScreenShareStage
      v-if="hasScreenShare && activeScreenShareStream"
      :is-interactive="isDense ? false : undefined"
      :presenter-name
      :stream="activeScreenShareStream"
      @fullscreen="emit('fullscreen')"
    />
    <div v-else flex-1 grid grid-auto-rows-fr :class="[isDense ? 'gap-2' : 'gap-3', callParticipantGridClass]">
      <MessageContentCallParticipantTile
        v-for="participant of callParticipantMap.values()"
        :key="participant.id"
        :="getParticipantTileProps(participant)"
        @click="pinnedParticipantId = participant.id"
      />
    </div>
    <div
      v-if="isScreenSharePresenting"
      flex
      shrink-0
      flex-col
      items-center
      overflow-y-auto
      :class="isDense ? 'gap-y-2' : 'gap-y-3'"
    >
      <MessageContentCallParticipantTile
        v-for="participant of callParticipantMap.values()"
        :key="participant.id"
        shrink-0
        aspect-video
        :class="isDense ? 'h-20' : 'h-32'"
        :="getParticipantTileProps(participant)"
        @click="pinnedParticipantId = participant.id"
      />
    </div>
  </main>
</template>
