<script setup lang="ts">
import { VUEJS_LOGO_UWU_PATH } from "#shared/services/esposter/constants";

const isDark = useIsDark();
const { smAndDown } = useDisplay();
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
    <div class="text-grey" text-2xl>An approachable, performant and versatile javascript application powered by</div>
    <v-img id="uwu" width="100%" max-width="45rem" :src="VUEJS_LOGO_UWU_PATH" alt="uwu" />
  </div>
</template>

<style scoped lang="scss">
.accent {
  color: transparent;
  background-image: $vue-gradient;
  background-clip: text;
}
</style>
