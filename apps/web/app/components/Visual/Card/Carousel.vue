<!-- @BIG CREDIT TO Braedon Wooding for providing the base animation code for this AMAZING card carousel -->
<script setup lang="ts">
import type { Card } from "@/models/visual/Card";
import type { CardStackGeometry } from "@/models/visual/CardStackGeometry";
import type { CardStackState } from "@/models/visual/CardStackState";
import type { CardStyleVariables } from "@/models/visual/CardStyleVariables";

import CardBase from "@/components/Visual/Card/Base.vue";
import { getCardStackClass } from "@/services/visual/getCardStackClass";
import { getCardStyles } from "@/services/visual/getCardStyles";
import { getInactiveCardScaleY } from "@/services/visual/getInactiveCardScaleY";
import { getNormalCardStyles } from "@/services/visual/getNormalCardStyles";
import { takeOne } from "@esposter/shared";

interface Props {
  cards: Card[];
  cardScaleYRatioLoss?: number;
  cardTemplate?: Component;
  duration?: number;
  maxShownCards?: number;
}

const {
  cards,
  // Ratio of how much shorter the next card is
  cardScaleYRatioLoss = 0.05,
  cardTemplate = CardBase,
  // Duration before cards move
  duration = Temporal.Duration.from({ seconds: 10 }).total("milliseconds"),
  maxShownCards = 5,
} = defineProps<Props>();
// Generate CSS card styling for smooth, non-jumping animations.
// Layout is a 1x2 grid: the left item holds the moving card, the right item holds the stack.
// - The left card animates right -> left, then back to the right for the next card.
// - Each right card has its own animation describing how it moves to the next position.
// The right stack size is variable (up to maxShownCards) and breakpoints change card sizing,
// So we offload the work to SASS generation + Vue style variables and keep the styling generic.
// When card count exceeds the maximum, the shuffle is kept subtle:
// - Hide the old last card behind the second-last one.
// - Slide the left card to the far right.
// - Shuffle every other right card left, exposing a new card atop the second right-most.
const { activeCardId, cardIds, inactiveCardId } = useCardCarousel({ cards: () => cards, duration });
// Re-animate on every screen change to avoid cards getting stuck in weird positions.
const { breakpoints, width } = useUiDisplay();
const gap = computed<string>(() => {
  let gapSize = 2;
  if (width.value >= breakpoints.xxl) gapSize = 6;
  else if (width.value >= breakpoints.xl) gapSize = 3;
  return `${gapSize}rem`;
});
// Each card from right -> left gains margin, multiplied by this breakpoint-dependent scale.
const scale = computed<number>(() => {
  let scaleFactor = 1;
  if (width.value >= breakpoints.xxl) scaleFactor = 2.5;
  else if (width.value >= breakpoints.xl) scaleFactor = 1.25;
  return scaleFactor;
});
const geometry = computed<CardStackGeometry>(() => ({
  cardCount: cards.length,
  cardScaleYRatioLoss,
  maxShownCards,
  scale: scale.value,
}));
const state = computed<CardStackState>(() => ({
  activeCardId: activeCardId.value,
  cardIds: cardIds.value,
  inactiveCardId: inactiveCardId.value,
  maxShownCards,
}));
const classes = computed(() => cardIds.value.map((cardId) => getCardStackClass(cardId, state.value)));
const normalCardStyles = computed(() => getNormalCardStyles(geometry.value));
const cardStyles = computed(() => getCardStyles(cardIds.value, normalCardStyles.value));
const activeCardStyle = computed<CardStyleVariables>(() => ({
  oldMarginRight: normalCardStyles.value.length > 0 ? takeOne(normalCardStyles.value).marginRight : "0",
}));
const inactiveCardStyle = computed<CardStyleVariables>(() => ({ scaleY: getInactiveCardScaleY(geometry.value) }));
</script>

<template>
  <div flex-1 grid cols-2>
    <div
      v-for="(card, index) of cards"
      :key="index"
      :style="cardStyles[cardIds.indexOf(index)]"
      :class="classes[cardIds.indexOf(index)]"
      row="start-1"
      col="start-2"
    >
      <VisualRotatingDiv>
        <component :is="cardTemplate" :card />
      </VisualRotatingDiv>
    </div>
  </div>
</template>

<style scoped>
/* The JS code handles breakpoints/variables for each card. */
.active-card {
  z-index: 100 !important;
  /* Fake grid-gap. */
  padding-right: v-bind(gap);
  animation: active-card 2s ease both;
}

@keyframes active-card {
  0% {
    transform: translateX(0%) scaleY(1);
    /* Subtract v-bind(gap) since it has that much padding. */
    margin-right: calc(v-bind("activeCardStyle.oldMarginRight") - v-bind(gap));
  }
  /* End on the left, waiting to be sent back to the right. */
  100% {
    transform: translateX(-100%) scaleY(1);
    margin-right: 0;
  }
}

.inactive-card {
  z-index: 0;
  animation: inactive-card 3s ease both;
}

@keyframes inactive-card {
  0% {
    transform: translateX(-100%) scale(1);
    margin-right: 0;
    padding-right: v-bind(gap);
  }
  /* Scale in place first — the slide right starts after this. */
  20% {
    transform: translateX(-100%) scale(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
    padding-right: v-bind(gap);
  }
  /* Avoid the weird squishing look. */
  90% {
    transform: translateX(0%) scale(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
  }
  /* End in the place the active card left, at its own scale. */
  100% {
    transform: translateX(0%) scaleY(v-bind("inactiveCardStyle.scaleY"));
    margin-right: 0;
  }
}

.of-card {
  /* Could be optimised by not rendering these, but that's more than a display:none */
  /* since we'd need to handle the top card becoming normal. */
  display: none;
}

.normal-card {
  margin-right: var(--margin-right);
  transform: scaleY(var(--scale-y));
}

.normal-card-even,
.normal-card-odd {
  animation: normal-card-sway 2.5s ease both;
}

@keyframes normal-card-sway {
  0% {
    margin-right: var(--old-margin-right);
    transform: scaleY(var(--old-scale-y));
  }

  20% {
    margin-right: var(--old-margin-right);
    transform: scaleY(var(--old-scale-y));
  }

  40% {
    transform: scaleY(var(--scale-y));
  }

  100% {
    margin-right: var(--margin-right);
    transform: scaleY(var(--scale-y));
  }
}
</style>
