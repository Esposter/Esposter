<script setup lang="ts">
import { PINA_COLADA_PATH } from "@/util/constants.client";
</script>

<template>
  <NuxtLayout :main-attrs="{ 'max-h': 'screen' }">
    <v-container display="flex" justify="center">
      <v-img width="256" height="256" :src="PINA_COLADA_PATH" alt="Pina Colada" />
    </v-container>
  </NuxtLayout>
</template>
