<script setup lang="ts">
const privacyPolicyHtml = await $fetch<string>("/privacyPolicy.html");
</script>

<template>
  <NuxtLayout>
    <article class="privacy-policy" mx-a px-4 py-8 max-w-prose ui-body v-html="privacyPolicyHtml" />
  </NuxtLayout>
</template>

<style scoped>
/* The policy is a document from outside the app, so its elements take the library's type here rather than a class */
.privacy-policy :deep(:is(p, ul)) {
  margin-block: 1em;
}

.privacy-policy :deep(ul) {
  list-style-type: disc;
  padding-inline-start: 1.5em;
}

.privacy-policy :deep(:is(h1, h2, h3, h4)) {
  color: var(--ui-accent);
  font-family: var(--ui-font-pixel);
  margin-block: 1.5em 0.5em;
}

.privacy-policy :deep(h1) {
  font-size: var(--ui-text-title);
}

.privacy-policy :deep(h2) {
  font-size: var(--ui-text-heading);
}

.privacy-policy :deep(strong) {
  color: var(--ui-accent);
  font-weight: inherit;
}

.privacy-policy :deep(a) {
  color: var(--ui-accent);
  text-underline-offset: 0.25em;
}
</style>
