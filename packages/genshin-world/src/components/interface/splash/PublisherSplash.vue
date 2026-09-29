<script setup lang="ts">
import { PUBLISHER_RING_PATH, PUBLISHER_WORDMARK_PATH } from "#src/services/interface/splash/PublisherLogoPath";

// The ring's colours are drawn by angle through its traced shape, as the logo's are: cyan at the top, blue down the
// Left and along the foot, violet at the bottom right and pink at the hook, sampled round the recording's ring
const ringMask = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 880"><path d="${PUBLISHER_RING_PATH}"/></svg>`,
)}")`;
</script>

<template>
  <div class="publisher-splash" role="img" aria-label="HoYoverse">
    <div class="logo">
      <svg class="wordmark" viewBox="0 0 1200 200" aria-hidden="true"><path :d="PUBLISHER_WORDMARK_PATH" /></svg>
      <div class="glow"><div class="ring" /></div>
    </div>
  </div>
</template>

<style scoped>
/* Laid out on the game's 1080-unit-high screen, which scales with the height as the game's interface does, and with
   The width on a screen narrower than it is tall, so the logo stays whole there */
.publisher-splash {
  position: absolute;
  inset: 0;
  container-type: size;
  background: #fff;
}

/* The logo's box, centred as the game centres it: the wordmark's traced region, with the ring over its gap */
.logo {
  --unit: min(100cqh / 1080, 100cqw / 1080);
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 900);
  height: calc(var(--unit) * 150);
  translate: -50% -50%;
}

.wordmark {
  position: absolute;
  inset: 0;
  fill: #000;
}

/* The ring's soft blue halo */
.glow {
  position: absolute;
  top: calc(var(--unit) * 0.7);
  left: calc(var(--unit) * 102.8);
  width: calc(var(--unit) * 143.25);
  height: calc(var(--unit) * 150);
  filter: drop-shadow(0 0 calc(var(--unit) * 6) rgb(120 175 255 / 0.55));
}

.ring {
  width: 100%;
  height: 100%;
  background: conic-gradient(
    #9df7ff 0deg,
    #a0f7f8 30deg,
    #dcecf9 60deg,
    #fcbfee 75deg,
    #b8acef 105deg,
    #a9a7ff 150deg,
    #82adff 180deg,
    #78afff 200deg,
    #78afff 315deg,
    #80c1ff 330deg,
    #8fe3ff 345deg,
    #9df7ff 360deg
  );
  mask: v-bind(ringMask) center / 100% 100% no-repeat;
}
</style>
