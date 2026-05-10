<script setup lang="ts">
import { VUEJS_LOGO_UWU_PATH } from "#shared/services/app/constants";

const isDark = useIsDark();
const { smAndDown } = useVDisplay();
</script>

<template>
  <div flex flex-col items-center text-center>
    <div :class="{ accent: isDark }" font="[Inter] black" leading-tight :text="smAndDown ? '5xl' : '7xl'">
      The
      <span :class="{ accent: !isDark }">Progressive</span>
      <br />
      JavaScript Application
    </div>
    <br />
    <div text-2xl text-gray>An approachable, performant and versatile javascript application powered by</div>
    <v-img id="uwu" width="100%" max-width="45rem" :src="VUEJS_LOGO_UWU_PATH" alt="uwu" />
  </div>
</template>

<style scoped>
.accent {
  color: transparent;
  background-image: var(--vue-gradient);
  background-clip: text;
}
</style>
