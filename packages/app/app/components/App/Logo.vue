<script setup lang="ts">
import { SITE_NAME } from "@esposter/shared";

const logoImageUrl = useLogoImageUrl();
</script>

<template>
  <div>
    <v-img width="2rem" :src="logoImageUrl" :alt="SITE_NAME" />
  </div>
</template>
