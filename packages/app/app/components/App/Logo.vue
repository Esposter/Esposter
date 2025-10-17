<script setup lang="ts">
import { SITE_NAME } from "#shared/services/app/constants";
import { LOGO_IMAGE_URL } from "@/services/app/constants";
</script>

<template>
  <div>
    <v-img width="2rem" :src="LOGO_IMAGE_URL" :alt="SITE_NAME" />
  </div>
</template>
