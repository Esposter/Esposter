<script setup lang="ts">
import OrnamentDivider from "#src/components/interface/shared/OrnamentDivider.vue";
import { GAME_FONT_FAMILY } from "#src/services/interface/constants";
import { HEALTH_NOTICE_PARAGRAPHS, HEALTH_NOTICE_TITLE } from "#src/services/interface/splash/constants";
</script>

<template>
  <div class="health-notice">
    <div class="block" role="alert">
      <h2 class="title">{{ HEALTH_NOTICE_TITLE }}</h2>
      <OrnamentDivider class="divider" />
      <p v-for="paragraph of HEALTH_NOTICE_PARAGRAPHS" :key="paragraph" class="paragraph">{{ paragraph }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Laid out on the game's 1080-unit-high screen, which scales with the height as the game's interface does; the notice
   Spans a share of the width, so a wider screen shows it in fewer lines */
.health-notice {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  container-type: size;
  background: #fff;
  font-family: v-bind(GAME_FONT_FAMILY);
}

.block {
  --unit: calc(100cqh / 1080);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 85.26cqw;
  text-align: center;
}

.title {
  margin: 0;
  color: #303030;
  font-size: calc(var(--unit) * 44);
  font-weight: 700;
  line-height: calc(var(--unit) * 60);
}

.divider {
  align-self: stretch;
  margin-top: calc(var(--unit) * 18.5);
}

.paragraph {
  max-width: 82.4cqw;
  margin: calc(var(--unit) * 10.5) 0 0;
  color: #656565;
  font-size: calc(var(--unit) * 32);
  font-weight: 700;
  line-height: calc(var(--unit) * 48.75);
}

/* A blank line between paragraphs, as the notice sets them */
.paragraph + .paragraph {
  margin-top: calc(var(--unit) * 48.75);
}
</style>
