<script setup lang="ts">
import { SITE_NAME } from "#shared/services/app/constants";
import { getLogoImageUrl } from "@/services/app/getLogoImageUrl";

const logoImageUrl = getLogoImageUrl();
</script>

<template>
  <div>
    <v-img width="2rem" :src="logoImageUrl" :alt="SITE_NAME" />
  </div>
</template>
