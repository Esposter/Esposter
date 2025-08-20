<script setup lang="ts">
const { hasMoreMessagesSearched, messageSearchQuery, messagesSearched, readMoreMessagesSearched } =
  useMessageSearcher();
const menu = ref(false);
const onEscape = () => {
  (document.activeElement as HTMLElement | null)?.blur();
};
</script>

<template>
  <MessageContentSearchMenu v-model="menu" :messages="messagesSearched" :has-more="hasMoreMessagesSearched">
    <template #activator="props">
      <v-text-field
        v-model="messageSearchQuery"
        cursor-auto
        width="15rem"
        placeholder="Search"
        density="compact"
        hide-details
        clearable
        :="props"
        @keydown.esc="onEscape()"
      >
        <template #append-inner>
          <v-icon icon="mdi-magnify" />
        </template>
      </v-text-field>
    </template>
  </EsbabblerContentSearchMenu>
</template>
