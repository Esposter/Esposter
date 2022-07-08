<script setup lang="ts">
import { useTheme } from "vuetify/lib/framework.mjs";

const theme = useTheme();
</script>

<template>
  <div class="text-h2" :class="{ accent: theme.global.current.value.dark }" text="center" font="900" leading="tight">
    The
    <span :class="{ accent: !theme.global.current.value.dark }">Progressive</span>
    <br />
    Chat Application
  </div>
</template>

<style scoped lang="scss">
.accent {
  color: transparent;
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
}
</style>
