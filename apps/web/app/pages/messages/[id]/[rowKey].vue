<script setup lang="ts">
import { checkIsMessageRoute } from "@/services/router/checkIsMessageRoute";

definePageMeta({ middleware: "auth", validate: checkIsMessageRoute });
</script>

<template>
  <NuxtLayout name="messages" />
</template>
