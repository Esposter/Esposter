<script setup lang="ts">
const { callParticipantMap, getParticipantTileProps } = useCallParticipantTiles();
const callParticipantGridClass = computed(() => (callParticipantMap.value.size <= 1 ? "grid-cols-1" : "grid-cols-2"));
</script>

<template>
  <div bg-background flex flex-col size-full overflow-hidden>
    <div p-2 flex-1 gap-2 grid grid-auto-rows-fr min-h-0 :class="callParticipantGridClass">
      <MessageContentCallParticipantTile
        v-for="participant of callParticipantMap.values()"
        :key="participant.id"
        :="getParticipantTileProps(participant)"
      />
    </div>
    <MessageContentCallPipControlBar />
  </div>
</template>
