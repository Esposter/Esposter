<script setup lang="ts">
import { SITE_NAME } from "@esposter/shared";

interface StyledLogoProps {
  width?: string;
}

const { width = "2rem" } = defineProps<StyledLogoProps>();
const logoImageUrl = useLogoImageUrl();
</script>

<template>
  <div>
    <v-img :width :src="logoImageUrl" :alt="SITE_NAME" />
  </div>
</template>
