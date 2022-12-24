<script setup lang="ts">
import { SITE_NAME } from "@/util/constants.client";

const logoImageUrl = useLogoImageUrl();
</script>

<template>
  <img width="32" height="26" :src="logoImageUrl" :alt="SITE_NAME" />
</template>
