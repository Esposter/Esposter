<script setup lang="ts">
import { useAlertStore } from "@/store/alert";

const alertStore = useAlertStore();
const { alerts } = storeToRefs(alertStore);
const { deleteAlert } = alertStore;
</script>

<template>
  <v-slide-y-transition group>
    <v-alert
      v-for="alert of alerts"
      :key="alert.id"
      position="absolute"
      :icon="alert.icon"
      :location="alert.location"
      :text="alert.text"
      :type="alert.type"
      closable
      z-9999
      @click:close="deleteAlert(alert.id)"
    />
  </v-slide-y-transition>
</template>
