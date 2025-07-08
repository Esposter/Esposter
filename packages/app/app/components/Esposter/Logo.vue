<script setup lang="ts">
import { useLogoImageUrl } from "~/composables/useLogoImageUrl";
import { SITE_NAME } from "#shared/services/esposter/constants";

const logoImageUrl = useLogoImageUrl();
</script>

<template>
  <div>
    <v-img width="2rem" :src="logoImageUrl" :alt="SITE_NAME" />
  </div>
</template>
