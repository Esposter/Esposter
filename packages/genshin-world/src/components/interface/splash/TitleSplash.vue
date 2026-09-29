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

/* Its box placed so its ink sits where the English client's does: 590 units wide, 420 down, a hair left of centre,
   In the flat grey the game draws its title in on the splash */
.logo {
  --unit: calc(100cqh / 1080);
  position: absolute;
  top: calc(var(--unit) * 410.45);
  left: calc(50% - var(--unit) * 306.9);
  width: calc(var(--unit) * 611.4);
  aspect-ratio: 3840 / 1453;
  fill: #333;
}
</style>
