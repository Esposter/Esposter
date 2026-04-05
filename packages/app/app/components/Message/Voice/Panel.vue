<script setup lang="ts">
const { isInChannel, isMuted, join, leave, toggleMute } = useVoiceChannel();
</script>

<template>
  <v-list-item font-bold>
    Voice
    <template #append>
      <v-tooltip v-if="isInChannel" text="Leave Voice">
        <template #activator="{ props }">
          <v-btn
            :="props"
            icon="mdi-phone-hangup"
            size="small"
            variant="plain"
            bg-transparent
            :ripple="false"
            @click="leave"
          />
        </template>
      </v-tooltip>
      <v-tooltip v-else text="Join Voice">
        <template #activator="{ props }">
          <v-btn :="props" icon="mdi-phone" size="small" variant="plain" bg-transparent :ripple="false" @click="join" />
        </template>
      </v-tooltip>
      <v-tooltip v-if="isInChannel" :text="isMuted ? 'Unmute' : 'Mute'">
        <template #activator="{ props }">
          <v-btn
            :="props"
            :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
            size="small"
            variant="plain"
            bg-transparent
            :ripple="false"
            @click="toggleMute"
          />
        </template>
      </v-tooltip>
    </template>
  </v-list-item>
  <MessageVoiceParticipantList />
</template>
