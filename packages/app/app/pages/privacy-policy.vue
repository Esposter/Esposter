<script setup lang="ts">
const privacyPolicyHtml = await $fetch<string>("/privacyPolicy.html");
</script>

<template>
  <NuxtLayout>
    <v-container>
      <div v-html="privacyPolicyHtml" />
    </v-container>
  </NuxtLayout>
</template>

<style scoped>
/* https://chromium.googlesource.com/chromium/blink/+/master/Source/core/css/html.css */
:deep(p) {
  display: block;
  margin-block-start: 1rem;
  margin-block-end: 1rem;
  margin-inline-start: 0;
  margin-inline-end: 0;
}

:deep(h1) {
  display: block;
  font-size: 2rem;
  margin-block-start: 0.67rem;
  margin-block-end: 0.67rem;
  margin-inline-start: 0;
  margin-inline-end: 0;
  font-weight: bold;
}

:deep(h2) {
  display: block;
  font-size: 1.5rem;
  margin-block-start: 0.83rem;
  margin-block-end: 0.83rem;
  margin-inline-start: 0;
  margin-inline-end: 0;
  font-weight: bold;
}

:deep(h3) {
  display: block;
  font-size: 1.17rem;
  margin-block-start: 1rem;
  margin-block-end: 1rem;
  margin-inline-start: 0;
  margin-inline-end: 0;
  font-weight: bold;
}

:deep(h4) {
  display: block;
  margin-block-start: 1.33rem;
  margin-block-end: 1.33rem;
  margin-inline-start: 0;
  margin-inline-end: 0;
  font-weight: bold;
}

:deep(ul, menu, dir) {
  display: block;
  list-style-type: disc;
  margin-block-start: 1rem;
  margin-block-end: 1rem;
  margin-inline-start: 0;
  margin-inline-end: 0;
  padding-inline-start: 2.5rem;
}
</style>
