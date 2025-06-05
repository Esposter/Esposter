<script setup lang="ts">
import { useAlertStore } from "@/store/alert";

const { alerts, deleteAlert } = useAlertStore();
</script>

<template>
  <v-slide-y-transition group>
    <v-alert
      v-for="alert in alerts"
      :key="alert.id"
      position="absolute"
      z-9999
      :icon="alert.icon"
      :location="alert.location"
      :text="alert.text"
      :type="alert.type"
      closable
      @click:close="deleteAlert(alert.id)"
    />
  </v-slide-y-transition>
</template>
