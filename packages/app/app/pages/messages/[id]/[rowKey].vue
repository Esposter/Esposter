<script setup lang="ts">
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";

definePageMeta({ middleware: "auth", validate: checkIsUuidRouteId });
</script>

<template>
  <NuxtLayout name="messages" />
</template>
