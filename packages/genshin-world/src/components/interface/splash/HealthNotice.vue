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
/* Laid out on the game's 1080-unit-high screen, which scales with the height as the game's interface does. Measured
   From the English client's notice and held against the Japanese one's at 60 frames: the divider spans the screen's
   Width less 190 units a side and the text 20 units inside it, so a wider screen sets the notice in fewer lines. The
   Sizes are the English client's cap heights (heading 38.7 units, text 27.4) in the fallback face; the game's own face
   Is narrower-capped, so they hold once it is present. The colours are the Japanese recording's, whose large glyphs
   Read their ink true where the English picture is sharpened */
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
  width: calc(100cqw - var(--unit) * 380);
  text-align: center;
}

.title {
  margin: 0;
  color: #303030;
  font-size: calc(var(--unit) * 54);
  font-weight: 700;
  line-height: calc(var(--unit) * 60);
}

.divider {
  align-self: stretch;
  margin-top: calc(var(--unit) * 14.5);
}

.paragraph {
  max-width: calc(100cqw - var(--unit) * 420);
  margin: calc(var(--unit) * 12.5) 0 0;
  color: #656565;
  font-size: calc(var(--unit) * 38);
  font-weight: 700;
  line-height: calc(var(--unit) * 48.36);
}

/* A blank line between paragraphs, as the notice sets them */
.paragraph + .paragraph {
  margin-top: calc(var(--unit) * 48.36);
}
</style>
