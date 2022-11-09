<script setup lang="ts">
const menu = $ref(false);
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn icon="mdi-message" size="large" position="fixed" bottom="8" right="8" z="9999" :="props" />
    </template>
    <v-card min-width="400" min-height="550">
      <v-toolbar class="v-app-bar">
        <template #append>
          <v-btn icon="mdi-close" @click="menu = false" />
        </template>
      </v-toolbar>
    </v-card>
  </v-menu>
</template>
