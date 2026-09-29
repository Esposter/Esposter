<script setup lang="ts">
import {
  PUBLISHER_LETTERS,
  PUBLISHER_LETTERS_ORIGIN,
  PUBLISHER_RING_BOX,
  PUBLISHER_RING_PATH,
} from "#src/services/interface/splash/PublisherLogoPath";
import { PUBLISHER_RING_BANDS } from "#src/services/interface/splash/PublisherRingBands";

// The logo's box is its SVG's, 1163 by 204, placed so its letters sit where the game's recording shows them (0.7633
// Game units to one of the logo's); the ring's colours are its field's, sampled by angle and by radius and drawn through
// Its silhouette: each band a conic gradient round the ring, laid over the band inside it through a radial mask that
// Ramps from the inner band's radius to its own, so the colour between two bands is their blend at every angle
const LOGO_WIDTH = 1163;
const LOGO_HEIGHT = 204;
const ringMask = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><path d="${PUBLISHER_RING_PATH}"/></svg>`,
)}")`;
// The game draws its ring a little up and to the left of where the Commons logo places it: the shift that best
// Registers the ring on the recording's, less the letters' own, in the logo's units
const RING_OFFSET = { x: -1.97, y: -3.93 };
const ringLeft = `${((PUBLISHER_RING_BOX.x + RING_OFFSET.x) / LOGO_WIDTH) * 100}%`;
const ringTop = `${((PUBLISHER_RING_BOX.y + RING_OFFSET.y) / LOGO_HEIGHT) * 100}%`;
const ringWidth = `${(PUBLISHER_RING_BOX.size / LOGO_WIDTH) * 100}%`;
const ringHeight = `${(PUBLISHER_RING_BOX.size / LOGO_HEIGHT) * 100}%`;
const ringBandStyles = PUBLISHER_RING_BANDS.map(({ colors, radius }, index) => {
  const stops = [...colors, colors[0]].map((color, stop) => `${color} ${(stop * 360) / colors.length}deg`).join(", ");
  const innerBand = PUBLISHER_RING_BANDS[index - 1];
  return {
    background: `conic-gradient(${stops})`,
    mask: innerBand
      ? `radial-gradient(circle closest-side, transparent ${innerBand.radius * 100}%, #000 ${radius * 100}%)`
      : undefined,
  };
});
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
      <div v-for="isGlow of [true, false]" :key="String(isGlow)" :class="['ring-box', { glow: isGlow }]">
        <div class="ring">
          <div v-for="(style, index) of ringBandStyles" :key="index" class="band" :style />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Laid out on the game's 1920 by 1080 unit screen, scaled to fit the window's height or its width, whichever is less, as the game's interface is */
.publisher-splash {
  position: absolute;
  inset: 0;
  container-type: size;
  background: #fff;
}

/* Centred on the screen as the game centres it, 74.53 units above the middle, so a window narrower than 16:9 keeps
   It in the middle rather than where a 1080-high screen's top would put it */
.logo {
  --unit: min(100cqh / 1080, 100cqw / 1920);
  position: absolute;
  top: calc(50% - var(--unit) * 74.53);
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
  position: relative;
  width: 100%;
  height: 100%;
  mask: v-bind(ringMask) center / 100% 100% no-repeat;
}

.band {
  position: absolute;
  inset: 0;
}
</style>
