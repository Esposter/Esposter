<script setup lang="ts">
const { hasMoreMessagesSearched, messageSearchQuery, messagesSearched, readMoreMessagesSearched } =
  useMessageSearcher();
const menu = ref(false);
</script>

<template>
  <EsbabblerContentSearchMenu v-model="menu" :messages="messagesSearched" :has-more="hasMoreMessagesSearched">
    <template #activator="props">
      <v-text-field
        ref="input"
        v-model="messageSearchQuery"
        cursor-auto
        width="15rem"
        placeholder="Search"
        density="compact"
        hide-details
        clearable
        :="props"
      >
        <template #append-inner>
          <v-icon icon="mdi-magnify" />
        </template>
      </v-text-field>
    </template>
  </EsbabblerContentSearchMenu>
</template>
