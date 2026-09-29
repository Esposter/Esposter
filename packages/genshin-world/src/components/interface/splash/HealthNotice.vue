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
/* Laid out on the game's 1080-unit-high screen, which scales with the height as the game's interface does, and with
   The width on a screen narrower than it is tall, so the text keeps a readable measure there. Measured
   From the English client's notice and held against the Japanese one's at 60 frames: the divider spans the screen's
   Width less 190 units a side and the text 20 units inside it, so a wider screen sets the notice in fewer lines. The
   Sizes are the ones that score best against the English client's notice in Asap (heading 57 units, text 39.5), since
   Its letters are proportioned apart from the game's own face. The text's grey is the Japanese recording's, which the English
   Picture's text agrees with; the English heading is near black, darker than the Japanese one's */
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
  --unit: min(100cqh / 1080, 100cqw / 1080);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100cqw - var(--unit) * 380);
  text-align: center;
}

.title {
  margin: 0;
  color: #1d1d1d;
  font-size: calc(var(--unit) * 57);
  font-weight: 600;
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
  font-size: calc(var(--unit) * 39.5);
  font-weight: 600;
  line-height: calc(var(--unit) * 48.36);
}

/* A blank line between paragraphs, as the notice sets them */
.paragraph + .paragraph {
  margin-top: calc(var(--unit) * 48.36);
}
</style>
