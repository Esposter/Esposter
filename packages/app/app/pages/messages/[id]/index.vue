<script setup lang="ts">
import { validate } from "@/services/router/validate";

definePageMeta({ middleware: "auth", validate });
</script>

<template>
  <NuxtLayout name="messages" />
</template>
