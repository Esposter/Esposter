<script setup lang="ts">
const message = ref("Aa");
const sendMessage = () => {};
</script>

<template>
  <v-text-field v-model="message" density="compact" clearable>
    <template #clear>
      <v-btn class="bg-transparent" icon="mdi-close-circle" size="small" flat @click="message = ''" />
    </template>
    <template #appendInner>
      <v-btn class="bg-transparent" icon="mdi-emoticon" size="small" flat />
      <v-btn
        class="bg-transparent"
        :icon="message ? 'mdi-send' : 'mdi-microphone'"
        size="small"
        flat
        @click="sendMessage"
      />
    </template>
  </v-text-field>
</template>
