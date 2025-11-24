<script setup lang="ts">
const { leaveHuddle, peerList, stream } = useHuddle();
const isMuted = ref(false);
</script>

<template>
  <div p-4 flex flex-col>
    <div mb-4 flex items-center justify-between>
      <span font-bold>Active Huddle</span>
      <v-btn icon="mdi-phone-hangup" color="error" variant="text" @click="leaveHuddle" />
    </div>
    <div flex flex-wrap gap-2>
      <div v-for="peer in peerList" :key="peer.user.id" flex flex-col items-center mr-4>
        <StyledAvatar :image="peer.user.image" :name="peer.user.name" :avatar-props="{ size: '48' }" />
        <span mt-1>{{ peer.user.name }}</span>
        <audio :srcObject="peer.stream" autoplay />
      </div>
    </div>
    <div flex justify-center mt-4>
      <v-btn
        :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
        variant="tonal"
        @click="
          () => {
            if (!stream) return;
            for (const track of stream.getAudioTracks()) track.enabled = !track.enabled;
            isMuted = !isMuted;
          }
        "
      />
    </div>
  </div>
</template>
