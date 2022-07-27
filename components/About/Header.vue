<script setup lang="ts">
const theme = useGlobalTheme();
</script>

<template>
  <div text="center">
    <div text="7xl" font="900" leading="tight" :class="{ accent: theme.dark }">
      The
      <span :class="{ accent: !theme.dark }">Progressive</span>
      <br />
      JavaScript Application
    </div>
    <br />
    <div class="text-grey" text="2xl">An approachable, performant and versatile javascript application.</div>
  </div>
</template>

<style scoped lang="scss">
.accent {
  color: transparent;
  background: $vueGradient;
  background-clip: text;
}
</style>
