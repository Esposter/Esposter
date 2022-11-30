<script setup lang="ts">
import { PINA_COLADA_PATH } from "@/util/constants.client";
</script>

<template>
  <NuxtLayout>
    <v-container h="screen" display="flex" items="center">
      <v-img cursor="pointer" width="256" height="256" :src="PINA_COLADA_PATH" alt="Piña Colada" />
    </v-container>
  </NuxtLayout>
</template>
