<script setup lang="ts">
const { hasMoreMessagesSearched, messageSearchQuery, messagesSearched, readMoreMessagesSearched } =
  useMessageSearcher();
const input = useTemplateRef("input");
const menu = ref(false);
</script>

<template>
  <EsbabblerContentSearchMenu v-model="menu" :has-more="hasMoreMessagesSearched" :messages="messagesSearched">
    <template #activator="props">
      <v-text-field
        ref="input"
        v-model="messageSearchQuery"
        width="15rem"
        placeholder="Search"
        density="compact"
        hide-details
        clearable
        :="props"
        @focus="menu = true"
        @keyup.esc="input?.blur()"
      >
        <template #append-inner>
          <v-icon icon="mdi-magnify" />
        </template>
      </v-text-field>
    </template>
  </EsbabblerContentSearchMenu>
</template>
