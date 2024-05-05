<script setup lang="ts">
const isDark = useIsDark();
const { smAndDown } = useDisplay();
</script>

<template>
  <div text-center>
    <div font-900 leading-tight font-inter :class="{ accent: isDark }" :text="smAndDown ? '5xl' : '7xl'">
      The
      <span :class="{ accent: !isDark }">Progressive</span>
      <br />
      JavaScript Application
    </div>
    <br />
    <div class="text-grey" text-2xl>An approachable, performant and versatile javascript application.</div>
  </div>
</template>

<style scoped lang="scss">
.accent {
  color: transparent;
  background-image: $vue-gradient;
  background-clip: text;
}
</style>
