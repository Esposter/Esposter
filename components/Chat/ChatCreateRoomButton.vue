<script setup lang="ts"></script>

<template>
  <v-tooltip #activator="{ props }" location="top" text="Create DM">
    <v-btn icon="mdi-plus" size="small" flat :="props" />
  </v-tooltip>
</template>
