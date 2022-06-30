<script setup lang="ts">
import { ChatMessage } from "@/components/Chat/types";

const { message } = defineProps<ChatMessage>();
</script>

<template>
  <v-card>
    <v-list-item>{{ message }}</v-list-item>
  </v-card>
</template>
