<script setup lang="ts">
import { SITE_NAME } from "@esposter/shared";

interface AppLogoProps {
  width?: string;
}

const { width = "2rem" } = defineProps<AppLogoProps>();
const logoImageUrl = useLogoImageUrl();
</script>

<template>
  <div :style="{ width }">
    <NuxtImg w-full :src="logoImageUrl" :alt="SITE_NAME" />
  </div>
</template>
