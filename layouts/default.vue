<script setup lang="ts">
useHead({
  title: "Esposter",
  titleTemplate: (title) => (title ? `Esposter | ${title}` : "Esposter"),
  meta: [{ name: "description", content: "Esposter is a nice and casual place for posting random things." }],
  htmlAttrs: { lang: "en" },
});
</script>

<template>
  <slot />
</template>
