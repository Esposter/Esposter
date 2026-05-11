<script setup lang="ts">
import { VUEJS_LOGO_UWU_PATH } from "#shared/services/app/constants";

const isDark = useIsDark();
const { smAndDown } = useVDisplay();
const ACCENT_CLASSES = ["text-transparent", "bg-clip-text", "bg-[image:--vue-gradient]"];
</script>

<template>
  <div text-center flex flex-col items-center>
    <div
      :class="isDark ? ACCENT_CLASSES : []"
      font="[Inter]"
      leading-tight
      font-black
      :text="smAndDown ? '5xl' : '7xl'"
    >
      The
      <span :class="!isDark ? ACCENT_CLASSES : []">Progressive</span>
      <br />
      JavaScript Application
    </div>
    <br />
    <div text-2xl text-gray>An approachable, performant and versatile javascript application powered by</div>
    <v-img id="uwu" width="100%" max-width="45rem" :src="VUEJS_LOGO_UWU_PATH" alt="uwu" />
  </div>
</template>
