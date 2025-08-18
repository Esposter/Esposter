<script setup lang="ts">
const { hasMoreMessagesSearched, messageSearchQuery, messagesSearched, readMoreMessagesSearched } =
  useMessageSearcher();
const input = useTemplateRef("input");
</script>

<template>
  <v-text-field
    ref="input"
    v-model="messageSearchQuery"
    placeholder="Search messages"
    variant="solo"
    density="comfortable"
    flat
    hide-details
    clearable
    @keyup.esc="input?.blur()"
  >
    <template #append-inner>
      <v-icon icon="mdi-magnify" />
    </template>
  </v-text-field>
  <div px-4 py-2>
    <EsbabblerModelMessageList :items="messagesSearched" />
    <div v-if="hasMoreMessagesSearched" py-2 flex justify-center>
      <v-btn variant="text" @click="readMoreMessagesSearched(() => {})">Load more</v-btn>
    </div>
  </div>
</template>
