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

<style scoped lang="scss">
// https://chromium.googlesource.com/chromium/blink/+/master/Source/core/css/html.css
:deep(p) {
  display: block;
  -webkit-margin-before: 1rem;
  -webkit-margin-after: 1rem;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
}

:deep(h1) {
  display: block;
  font-size: 2rem;
  -webkit-margin-before: 0.67rem;
  -webkit-margin-after: 0.67rem;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
  font-weight: bold;
}

:deep(h2) {
  display: block;
  font-size: 1.5rem;
  -webkit-margin-before: 0.83rem;
  -webkit-margin-after: 0.83rem;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
  font-weight: bold;
}

:deep(h3) {
  display: block;
  font-size: 1.17rem;
  -webkit-margin-before: 1rem;
  -webkit-margin-after: 1rem;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
  font-weight: bold;
}

:deep(h4) {
  display: block;
  -webkit-margin-before: 1.33rem;
  -webkit-margin-after: 1.33rem;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
  font-weight: bold;
}

:deep(ul, menu, dir) {
  display: block;
  list-style-type: disc;
  -webkit-margin-before: 1rem;
  -webkit-margin-after: 1rem;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
  -webkit-padding-start: 2.5rem;
}
</style>
