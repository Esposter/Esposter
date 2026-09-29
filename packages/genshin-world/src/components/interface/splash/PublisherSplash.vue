<script setup lang="ts">
import {
  PUBLISHER_LETTERS,
  PUBLISHER_LETTERS_ORIGIN,
  PUBLISHER_RING_BOX,
  PUBLISHER_RING_PATH,
} from "#src/services/interface/splash/PublisherLogoPath";

// The logo's box is its SVG's, 1163 by 204, placed so its letters sit where the game's recording shows them (0.7633
// Game units to one of the logo's); the ring's colours are drawn by angle through its silhouette, as the logo's field
// Is, sampled round that field
const LOGO_WIDTH = 1163;
const LOGO_HEIGHT = 204;
const ringMask = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><path d="${PUBLISHER_RING_PATH}"/></svg>`,
)}")`;
const ringLeft = `${(PUBLISHER_RING_BOX.x / LOGO_WIDTH) * 100}%`;
const ringTop = `${(PUBLISHER_RING_BOX.y / LOGO_HEIGHT) * 100}%`;
const ringWidth = `${(PUBLISHER_RING_BOX.size / LOGO_WIDTH) * 100}%`;
const ringHeight = `${(PUBLISHER_RING_BOX.size / LOGO_HEIGHT) * 100}%`;
</script>

<template>
  <div class="publisher-splash" role="img" aria-label="HoYoverse">
    <div class="logo">
      <svg class="letters" :viewBox="`0 0 ${LOGO_WIDTH} ${LOGO_HEIGHT}`" aria-hidden="true">
        <g :transform="`translate(${PUBLISHER_LETTERS_ORIGIN.x} ${PUBLISHER_LETTERS_ORIGIN.y})`">
          <path
            v-for="({ offsetX, path }, index) of PUBLISHER_LETTERS"
            :key="index"
            :d="path"
            :transform="`translate(${offsetX})`"
          />
        </g>
      </svg>
      <!-- The ring over a blurred copy of itself at half strength, its glow, as the logo draws it -->
      <div class="ring-box glow"><div class="ring" /></div>
      <div class="ring-box"><div class="ring" /></div>
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

.logo {
  --unit: min(100cqh / 1080, 100cqw / 1080);
  position: absolute;
  top: calc(var(--unit) * 465.47);
  left: calc(50% - var(--unit) * 443.43);
  width: calc(var(--unit) * 887.7);
  height: calc(var(--unit) * 155.7);
}

.letters {
  position: absolute;
  inset: 0;
  fill: #000;
}

.ring-box {
  position: absolute;
  top: v-bind(ringTop);
  left: v-bind(ringLeft);
  width: v-bind(ringWidth);
  height: v-bind(ringHeight);
}

/* The logo's glow is its ring blurred by 8 of its units at half opacity; a filter on the masked element itself would
   Blur the colours before the mask cuts them, so it sits on a wrapper */
.glow {
  filter: blur(calc(var(--unit) * 6.1));
  opacity: 0.5;
}

.ring {
  width: 100%;
  height: 100%;
  background: conic-gradient(
    #9cf4ff 0deg,
    #acfeff 15deg,
    #c1f6ff 30deg,
    #9bf6ff 45deg,
    #d6e3fe 60deg,
    #fbbbf1 75deg,
    #f5b3f0 90deg,
    #b39efb 105deg,
    #a79fff 120deg,
    #b0a9ff 135deg,
    #a7aaff 150deg,
    #93adff 165deg,
    #81b0ff 180deg,
    #7bb1ff 195deg,
    #7ab1ff 210deg,
    #7ab1ff 315deg,
    #7db8ff 330deg,
    #8bd6ff 345deg,
    #9cf4ff 360deg
  );
  mask: v-bind(ringMask) center / 100% 100% no-repeat;
}
</style>
