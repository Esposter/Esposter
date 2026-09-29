<script setup lang="ts">
import { TITLE_LOGO_PATH } from "#src/services/interface/splash/TitleLogoPath";
</script>

<template>
  <div class="title-splash" role="img" aria-label="Genshin Impact">
    <svg class="logo" viewBox="0 0 3840 1453" aria-hidden="true"><path :d="TITLE_LOGO_PATH" /></svg>
  </div>
</template>

<style scoped>
/* Laid out on the game's 1080-unit-high screen, which scales with the height as the game's interface does */
.title-splash {
  position: absolute;
  inset: 0;
  container-type: size;
  background: #fff;
}

/* Centred, in the flat grey the game draws its title in on the splash, as tall as the Japanese client's logo stands */
.logo {
  --unit: calc(100cqh / 1080);
  position: absolute;
  top: 50%;
  left: 50%;
  height: calc(var(--unit) * 399);
  aspect-ratio: 3840 / 1453;
  fill: #303030;
  translate: -50% -50%;
}
</style>
